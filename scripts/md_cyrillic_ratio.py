#!/usr/bin/env python3
"""Report the share of Cyrillic letters in Markdown files."""

from __future__ import annotations

import argparse
import os
import sys
import unicodedata
from collections.abc import Iterator, Sequence
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class LetterRatio:
    """Letter counts and the resulting Cyrillic percentage for one file."""

    cyrillic_letters: int
    all_letters: int

    @property
    def percent(self) -> float:
        """Return Cyrillic letters as a percentage of all letters."""
        if self.all_letters == 0:
            return 0.0
        return self.cyrillic_letters * 100 / self.all_letters


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description=(
            "List Markdown files containing Cyrillic text and show Cyrillic "
            "letters as a percentage of all alphabetic characters."
        )
    )
    parser.add_argument(
        "roots",
        nargs="+",
        type=Path,
        help="files or directories to scan recursively",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        type=Path,
        help="file or directory to exclude; may be repeated",
    )
    return parser.parse_args(argv)


def normalize_path(path: Path) -> Path:
    """Return an absolute normalized path without requiring it to exist."""
    return path.expanduser().resolve(strict=False)


def is_excluded(path: Path, excluded_paths: frozenset[Path]) -> bool:
    """Return whether path is equal to or nested under an excluded path."""
    return any(path == excluded or excluded in path.parents for excluded in excluded_paths)


def iter_markdown_files(root: Path, excluded_paths: frozenset[Path]) -> Iterator[Path]:
    """Yield Markdown files below root without following directory symlinks."""
    if is_excluded(root, excluded_paths):
        return

    if root.is_file():
        if root.suffix.casefold() == ".md":
            yield root
        return

    if not root.is_dir():
        raise FileNotFoundError(f"scan root does not exist: {root}")

    for current_directory, directory_names, file_names in os.walk(
        root,
        topdown=True,
        followlinks=False,
    ):
        current_path = Path(current_directory)
        directory_names[:] = sorted(
            name
            for name in directory_names
            if name != ".git"
            and not is_excluded(current_path / name, excluded_paths)
            and not (current_path / name).is_symlink()
        )

        for file_name in sorted(file_names):
            file_path = current_path / file_name
            if (
                file_path.suffix.casefold() == ".md"
                and not file_path.is_symlink()
                and not is_excluded(file_path, excluded_paths)
            ):
                yield file_path


def calculate_letter_ratio(text: str) -> LetterRatio:
    """Count Cyrillic and total alphabetic characters in text."""
    all_letters = 0
    cyrillic_letters = 0

    for character in text:
        if not character.isalpha():
            continue
        all_letters += 1
        if unicodedata.name(character, "").startswith("CYRILLIC"):
            cyrillic_letters += 1

    return LetterRatio(
        cyrillic_letters=cyrillic_letters,
        all_letters=all_letters,
    )


def scan_roots(roots: Sequence[Path], excluded_paths: frozenset[Path]) -> int:
    """Scan roots, print matching files, and return a process exit code."""
    failed = False
    seen_files: set[Path] = set()

    for root in roots:
        try:
            markdown_files = iter_markdown_files(root, excluded_paths)
            for file_path in markdown_files:
                normalized_file = normalize_path(file_path)
                if normalized_file in seen_files:
                    continue
                seen_files.add(normalized_file)

                try:
                    text = normalized_file.read_text(encoding="utf-8")
                except (OSError, UnicodeError) as error:
                    print(f"error: cannot read {normalized_file}: {error}", file=sys.stderr)
                    failed = True
                    continue

                ratio = calculate_letter_ratio(text)
                if ratio.cyrillic_letters > 0:
                    print(f"{normalized_file} | {ratio.percent:.2f}%")
        except OSError as error:
            print(f"error: {error}", file=sys.stderr)
            failed = True

    return 1 if failed else 0


def main(argv: Sequence[str] | None = None) -> int:
    """Run the Markdown Cyrillic-ratio CLI."""
    args = parse_args(argv)
    roots = [normalize_path(root) for root in args.roots]
    excluded_paths = frozenset(normalize_path(path) for path in args.exclude)
    return scan_roots(roots, excluded_paths)


if __name__ == "__main__":
    raise SystemExit(main())
