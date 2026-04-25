import os
import re
from collections import Counter


class SpellChecker:
    def __init__(self, dictionary_path=None):
        self.words = Counter()
        self.ignored_words = set()
        self._load_default_dictionary()
        
        if dictionary_path and os.path.exists(dictionary_path):
            self._load_dictionary(dictionary_path)
            
    def _load_default_dictionary(self):
        common_words = [
            "the", "be", "to", "of", "and", "a", "in", "for", "is", "on",
            "that", "by", "this", "with", "i", "you", "it", "not", "or",
            "he", "as", "she", "at", "we", "his", "her", "my", "me", "an",
            "your", "they", "them", "their", "our", "us", "so", "if", "no",
            "but", "what", "when", "where", "who", "why", "how", "all",
            "each", "every", "both", "few", "more", "most", "other", "some",
            "such", "which", "can", "could", "may", "might", "will", "would",
            "should", "must", "shall", "do", "does", "did", "have", "has",
            "had", "having", "be", "been", "being", "was", "were", "are",
            "is", "am", "from", "about", "into", "through", "during", "before",
            "after", "above", "below", "between", "under", "again", "further",
            "then", "once", "here", "there", "only", "just", "very", "really",
            "also", "still", "always", "never", "ever", "already", "yet",
            "new", "one", "two", "three", "first", "second", "third", "last",
            "next", "over", "out", "up", "down", "off", "away", "back",
            "good", "well", "bad", "better", "best", "worse", "worst",
            "great", "little", "much", "many", "more", "most", "less", "least",
            "same", "different", "like", "unlike", "right", "wrong", "true",
            "false", "yes", "no", "on", "off", "open", "close", "start",
            "end", "begin", "finish", "stop", "go", "come", "leave", "stay",
            "get", "give", "take", "make", "do", "see", "hear", "feel",
            "think", "know", "believe", "understand", "remember", "forget",
            "want", "need", "love", "hate", "like", "dislike", "help",
            "use", "find", "lose", "keep", "send", "receive", "buy", "sell",
            "pay", "cost", "spend", "save", "time", "day", "week", "month",
            "year", "hour", "minute", "second", "morning", "afternoon",
            "evening", "night", "today", "tomorrow", "yesterday", "now",
            "man", "woman", "child", "person", "people", "family", "friend",
            "home", "house", "room", "door", "window", "table", "chair",
            "book", "paper", "pen", "pencil", "computer", "phone", "work",
            "job", "school", "college", "university", "student", "teacher",
            "doctor", "nurse", "water", "food", "eat", "drink", "sleep",
            "walk", "run", "jump", "sit", "stand", "lie", "read", "write",
            "talk", "speak", "say", "tell", "ask", "answer", "call", "name",
            "word", "letter", "number", "line", "page", "file", "folder",
            "program", "software", "hardware", "data", "information", "code",
            "function", "variable", "class", "object", "method", "module",
            "import", "export", "return", "print", "input", "output", "if",
            "else", "elif", "for", "while", "break", "continue", "try",
            "except", "finally", "raise", "def", "class", "import", "from",
            "as", "with", "lambda", "yield", "global", "nonlocal", "assert",
            "pass", "del", "in", "not", "is", "and", "or", "True", "False",
            "None", "self", "init", "main", "test", "debug", "error", "bug",
            "fix", "update", "upgrade", "install", "uninstall", "download",
            "upload", "copy", "paste", "cut", "delete", "undo", "redo",
            "save", "load", "open", "close", "create", "destroy", "build",
            "compile", "run", "execute", "start", "stop", "pause", "resume",
            "menu", "setting", "option", "preference", "config", "configuration",
            "window", "dialog", "button", "text", "edit", "input", "field",
            "label", "list", "box", "check", "radio", "combo", "dropdown",
            "scroll", "bar", "tab", "panel", "frame", "widget", "control",
            "layout", "grid", "row", "column", "align", "center", "left",
            "right", "top", "bottom", "margin", "padding", "border", "color",
            "background", "foreground", "font", "size", "style", "theme",
            "dark", "light", "mode", "normal", "insert", "visual", "command",
            "search", "find", "replace", "match", "pattern", "regex", "regular",
            "expression", "case", "sensitive", "insensitive", "whole", "word",
            "anchor", "link", "hyperlink", "jump", "navigate", "navigator",
            "header", "title", "section", "paragraph", "line", "block", "quote",
            "bold", "italic", "underline", "strike", "code", "inline", "block",
            "list", "ordered", "unordered", "bullet", "number", "item", "task",
            "checkbox", "table", "cell", "row", "column", "border", "align",
            "image", "picture", "fig", "figure", "caption", "alt", "text",
            "footnote", "reference", "citation", "definition", "term", "glossary",
            "toc", "table", "contents", "index", "outline", "summary", "abstract",
            "metadata", "yaml", "frontmatter", "title", "author", "date", "tags",
            "categories", "draft", "published", "updated", "modified", "created",
            "version", "revision", "history", "log", "change", "diff", "compare",
            "merge", "conflict", "resolve", "branch", "tag", "commit", "push",
            "pull", "fetch", "clone", "init", "add", "remove", "reset", "revert",
            "stash", "pop", "apply", "drop", "clean", "status", "log", "show",
            "diff", "blame", "bisect", "rebase", "merge", "cherry-pick", "revert",
            "checkout", "switch", "restore", "reset", "rm", "mv", "mkdir", "rmdir",
            "touch", "cat", "less", "more", "head", "tail", "grep", "find", "ls",
            "cd", "pwd", "mkdir", "rmdir", "rm", "cp", "mv", "chmod", "chown",
            "tar", "zip", "unzip", "curl", "wget", "ssh", "scp", "rsync", "git",
            "python", "python3", "pip", "pip3", "venv", "virtualenv", "conda",
            "javascript", "js", "node", "npm", "yarn", "typescript", "ts", "tsc",
            "java", "javac", "jar", "maven", "gradle", "csharp", "go", "golang",
            "rust", "cargo", "ruby", "gem", "bundler", "php", "composer", "perl",
            "swift", "kotlin", "dart", "flutter", "react", "vue", "angular",
            "django", "flask", "fastapi", "express", "spring", "rails", "laravel",
            "markdown", "md", "html", "css", "sass", "scss", "less", "stylus",
            "json", "xml", "yaml", "yml", "toml", "ini", "cfg", "conf", "env",
            "markdown", "editor", "viewer", "preview", "render", "parse", "process",
            "convert", "transform", "format", "pretty", "beautify", "minify",
            "compress", "decompress", "encode", "decode", "encrypt", "decrypt",
            "validate", "verify", "check", "test", "lint", "debug", "profile",
            "optimize", "refactor", "clean", "organize", "sort", "filter", "map",
            "reduce", "fold", "zip", "enumerate", "slice", "split", "join",
            "replace", "substitute", "search", "find", "match", "extract",
            "trim", "strip", "lstrip", "rstrip", "upper", "lower", "capitalize",
            "title", "swapcase", "count", "len", "length", "size", "index",
            "find", "rfind", "startswith", "endswith", "isalpha", "isdigit",
            "isalnum", "isspace", "islower", "isupper", "istitle", "isnumeric",
            "isdecimal", "isidentifier", "isprintable", "encode", "decode",
            "bytes", "bytearray", "memoryview", "list", "tuple", "dict", "set",
            "frozenset", "str", "int", "float", "complex", "bool", "None",
            "type", "id", "hash", "dir", "help", "globals", "locals", "vars",
            "callable", "issubclass", "isinstance", "hasattr", "getattr", "setattr",
            "delattr", "property", "staticmethod", "classmethod", "super",
            "abs", "all", "any", "ascii", "bin", "bool", "bytearray", "bytes",
            "callable", "chr", "classmethod", "compile", "complex", "delattr",
            "dict", "dir", "divmod", "enumerate", "eval", "exec", "filter",
            "float", "format", "frozenset", "getattr", "globals", "hasattr",
            "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass",
            "iter", "len", "list", "locals", "map", "max", "memoryview", "min",
            "next", "object", "oct", "open", "ord", "pow", "print", "property",
            "range", "repr", "reversed", "round", "set", "setattr", "slice",
            "sorted", "staticmethod", "str", "sum", "super", "tuple", "type",
            "vars", "zip", "import", "from", "as", "with", "lambda", "yield",
            "global", "nonlocal", "assert", "pass", "del", "in", "not", "is",
            "and", "or", "if", "else", "elif", "for", "while", "break", "continue",
            "try", "except", "finally", "raise", "def", "class", "return", "None"
        ]
        
        for word in common_words:
            self.words[word.lower()] += 1
            
    def _load_dictionary(self, path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    word = line.strip().lower()
                    if word:
                        self.words[word] += 1
        except Exception:
            pass
            
    def _edits1(self, word):
        letters = 'abcdefghijklmnopqrstuvwxyz'
        splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
        deletes = [L + R[1:] for L, R in splits if R]
        transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
        replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
        inserts = [L + c + R for L, R in splits for c in letters]
        return set(deletes + transposes + replaces + inserts)
        
    def _edits2(self, word):
        return (e2 for e1 in self._edits1(word) for e2 in self._edits1(e1))
        
    def _known(self, words):
        return set(w for w in words if w in self.words)
        
    def check(self, word):
        if not word or len(word) < 2:
            return True
        if word.lower() in self.ignored_words:
            return True
        return word.lower() in self.words
        
    def suggest(self, word):
        word_lower = word.lower()
        
        candidates = (
            self._known([word_lower]) or
            self._known(self._edits1(word_lower)) or
            self._known(self._edits2(word_lower)) or
            [word_lower]
        )
        
        suggestions = sorted(candidates, key=lambda w: self.words.get(w, 0), reverse=True)
        
        if word.istitle() and suggestions:
            suggestions = [s.title() for s in suggestions]
        elif word.isupper() and suggestions:
            suggestions = [s.upper() for s in suggestions]
            
        return suggestions[:10]
        
    def add(self, word):
        word_lower = word.lower()
        self.words[word_lower] += 1
        
    def ignore(self, word):
        self.ignored_words.add(word.lower())
