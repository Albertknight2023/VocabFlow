from __future__ import annotations

import re
import time
from dataclasses import dataclass
from typing import Any

import requests

_WORD_RE = re.compile(r"^[A-Za-z][A-Za-z\-']*$")
_CACHE_TTL_SECONDS = 300
_lookup_cache: dict[str, tuple[float, DictionaryEntry]] = {}
_translation_cache: dict[str, tuple[float, str]] = {}
_PART_OF_SPEECH_LABELS = {
    "noun": "n.",
    "verb": "v.",
    "adjective": "adj.",
    "adverb": "adv.",
    "pronoun": "pron.",
    "preposition": "prep.",
    "conjunction": "conj.",
    "interjection": "int.",
    "article": "art.",
    "prefix": "pref.",
    "suffix": "suf.",
    "numeral": "num.",
    "abbreviation": "abbr.",
}


@dataclass
class DictionaryEntry:
    text: str
    phonetic: str | None
    part_of_speech: str | None
    meaning: str
    english_definition: str


class DictionaryLookupError(Exception):
    pass


def is_valid_english_word(text: str) -> bool:
    return bool(_WORD_RE.fullmatch(text.strip()))


def _get_cached_value(cache: dict[str, tuple[float, Any]], key: str) -> Any | None:
    cached = cache.get(key)
    if not cached:
        return None

    cached_at, value = cached
    if time.monotonic() - cached_at > _CACHE_TTL_SECONDS:
        cache.pop(key, None)
        return None

    return value


def _set_cached_value(cache: dict[str, tuple[float, Any]], key: str, value: Any) -> None:
    cache[key] = (time.monotonic(), value)


def _clean_translated_text(text: str) -> str:
    return text.strip().strip("。；;,.、 ")


def _format_part_of_speech(part_of_speech: str | None) -> str | None:
    if not part_of_speech:
        return None
    normalized = part_of_speech.strip().lower()
    if not normalized:
        return None
    return _PART_OF_SPEECH_LABELS.get(normalized, f"{normalized}.")


def _translate_with_google(text: str) -> str | None:
    try:
        response = requests.get(
            "https://translate.googleapis.com/translate_a/single",
            params={
                "client": "gtx",
                "sl": "en",
                "tl": "zh-CN",
                "dt": "t",
                "q": text,
            },
            timeout=4,
        )
    except requests.RequestException:
        return None

    if response.status_code != 200:
        return None

    try:
        payload = response.json()
    except ValueError:
        return None

    if not isinstance(payload, list) or not payload or not isinstance(payload[0], list):
        return None

    translated = "".join(
        segment[0]
        for segment in payload[0]
        if isinstance(segment, list) and segment and isinstance(segment[0], str)
    ).strip()
    if not translated:
        return None
    if translated.lower() == text.lower():
        return None
    return translated


def translate_to_chinese(text: str) -> str:
    normalized = text.strip()
    cached_translation = _get_cached_value(_translation_cache, normalized.lower())
    if cached_translation:
        return cached_translation

    translated = _translate_with_google(normalized)
    if translated:
        translated = _clean_translated_text(translated)
        _set_cached_value(_translation_cache, normalized.lower(), translated)
        return translated

    raise DictionaryLookupError("在线翻译服务暂不可用，请稍后重试")


def _translate_definition(text: str) -> str:
    cached_translation = _get_cached_value(_translation_cache, text.lower())
    if cached_translation:
        return cached_translation

    translated = _translate_with_google(text)
    if translated:
        translated = _clean_translated_text(translated)
        _set_cached_value(_translation_cache, text.lower(), translated)
        return translated

    return text


def _translate_definition_group(definitions: list[str]) -> str | None:
    if not definitions:
        return None

    chunks: list[list[str]] = []
    current_chunk: list[str] = []
    current_length = 0
    max_chunk_length = 430

    for definition in definitions:
        numbered_definition = f"{len(current_chunk) + 1}. {definition}"
        projected_length = current_length + len(numbered_definition) + (1 if current_chunk else 0)

        if current_chunk and projected_length > max_chunk_length:
            chunks.append(current_chunk)
            current_chunk = []
            current_length = 0

        current_chunk.append(definition)
        current_length += len(numbered_definition) + (1 if len(current_chunk) > 1 else 0)

    if current_chunk:
        chunks.append(current_chunk)

    translated_chunks: list[str] = []
    for chunk_index, chunk_definitions in enumerate(chunks):
        block = "\n".join(f"{index + 1}. {definition}" for index, definition in enumerate(chunk_definitions))
        cache_key = f"group:{chunk_index}:{block.lower()}"
        cached_translation = _get_cached_value(_translation_cache, cache_key)
        if cached_translation:
            translated_chunks.append(cached_translation)
            continue

        translated_block = _translate_with_google(block)

        translated_text = None
        if translated_block:
            translated_lines: list[str] = []
            for line in translated_block.splitlines():
                line = _clean_translated_text(line)
                if not line:
                    continue
                match = re.match(r"^\s*\d+\.\s*(.*)$", line)
                translated_lines.append(_clean_translated_text(match.group(1) if match else line))

            translated_text = "；".join(line for line in translated_lines if line)
            if not translated_text:
                translated_text = _clean_translated_text(translated_block)

        if translated_text:
            _set_cached_value(_translation_cache, cache_key, translated_text)
            translated_chunks.append(translated_text)

    if not translated_chunks:
        return None

    return "；".join(translated_chunks)


def _build_full_meaning(meanings: list[dict[str, Any]]) -> str | None:
    if not meanings:
        return None

    grouped_parts: dict[str, list[str]] = {}
    part_order: list[str] = []
    pending_translations: list[tuple[str, list[str]]] = []

    for meaning_item in meanings:
        if not isinstance(meaning_item, dict):
            continue

        part_of_speech = _format_part_of_speech(meaning_item.get("partOfSpeech")) or ""
        definitions = meaning_item.get("definitions") or []
        definition_texts: list[str] = []

        for definition_item in definitions:
            if not isinstance(definition_item, dict):
                continue
            definition_text = (definition_item.get("definition") or "").strip()
            if not definition_text:
                continue
            definition_texts.append(definition_text)

        if definition_texts:
            pending_translations.append((part_of_speech, definition_texts))

    if not pending_translations:
        return None

    for part_of_speech, definition_texts in pending_translations:
        translated_definition = _translate_definition_group(definition_texts)
        if not translated_definition:
            continue

        if part_of_speech not in grouped_parts:
            grouped_parts[part_of_speech] = []
            part_order.append(part_of_speech)
        grouped_parts[part_of_speech].append(translated_definition)

    formatted_parts: list[str] = []
    for part_of_speech in part_order:
        joined_definitions = "；".join(grouped_parts[part_of_speech])
        if part_of_speech:
            formatted_parts.append(f"{part_of_speech} {joined_definitions}")
        else:
            formatted_parts.append(joined_definitions)

    return "；".join(formatted_parts)


def lookup_english_word(text: str) -> DictionaryEntry:
    word = text.strip()
    if not is_valid_english_word(word):
        raise DictionaryLookupError("请输入英文单词，不能包含数字或其他符号")

    cached_entry = _get_cached_value(_lookup_cache, word.lower())
    if cached_entry:
        return cached_entry

    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}", timeout=8)
    except requests.RequestException as exc:
        raise DictionaryLookupError("在线词典服务连接超时，请稍后重试") from exc

    if response.status_code != 200:
        raise DictionaryLookupError("在线词典未找到该单词")

    try:
        payload = response.json()
    except ValueError as exc:
        raise DictionaryLookupError("在线词典返回格式异常，请稍后重试") from exc
    if not isinstance(payload, list) or not payload:
        raise DictionaryLookupError("在线词典未找到该单词")

    entry = payload[0] or {}
    phonetic = entry.get("phonetic")
    phonetics = entry.get("phonetics") or []
    if not phonetic and phonetics:
        phonetic = next(
            (item.get("text") for item in phonetics if isinstance(item, dict) and item.get("text")),
            None,
        )

    part_of_speech = None
    meaning = None
    definition_en = None
    meanings = entry.get("meanings") or []
    if meanings:
        first_meaning = meanings[0] or {}
        part_of_speech = first_meaning.get("partOfSpeech")
        definitions = first_meaning.get("definitions") or []
        if definitions:
            first_definition = definitions[0] or {}
            definition_en = first_definition.get("definition")

    if not definition_en:
        raise DictionaryLookupError("在线词典未能返回有效释义")

    meaning = _build_full_meaning(meanings)
    if not meaning:
        raise DictionaryLookupError("在线词典未能返回有效中文释义")

    entry_result = DictionaryEntry(
        text=word,
        phonetic=phonetic,
        part_of_speech=part_of_speech,
        meaning=meaning,
        english_definition=definition_en,
    )
    _set_cached_value(_lookup_cache, word.lower(), entry_result)
    return entry_result
