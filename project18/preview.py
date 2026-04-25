import re
from PyQt5.QtWidgets import QTextBrowser
from PyQt5.QtCore import Qt, QUrl, pyqtSignal
from PyQt5.QtGui import QFont, QDesktopServices


class MarkdownPreview(QTextBrowser):
    anchor_clicked = pyqtSignal(str)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()
        self._markdown = ""
        
    def _setup_ui(self):
        self.setReadOnly(True)
        self.setOpenExternalLinks(False)
        self.setOpenLinks(False)
        
        font = QFont("Microsoft YaHei", 11)
        self.setFont(font)
        
        self.setStyleSheet("""
            QTextBrowser {
                background-color: #ffffff;
                color: #333333;
                border: none;
                padding: 10px;
            }
        """)
        
        self.anchorClicked.connect(self._on_anchor_clicked)
        
    def set_markdown(self, markdown):
        self._markdown = markdown
        html = self._markdown_to_html(markdown)
        self.setHtml(html)
        
    def _markdown_to_html(self, markdown):
        lines = markdown.split('\n')
        html_lines = []
        in_code_block = False
        code_block_content = []
        in_list = False
        list_content = []
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            if line.strip().startswith('```'):
                if in_code_block:
                    in_code_block = False
                    html_lines.append(self._format_code_block(code_block_content))
                    code_block_content = []
                else:
                    in_code_block = True
                i += 1
                continue
                
            if in_code_block:
                code_block_content.append(line)
                i += 1
                continue
                
            if re.match(r'^#{1,6} ', line):
                if in_list:
                    html_lines.append(self._format_list(list_content))
                    list_content = []
                    in_list = False
                html_lines.append(self._format_header(line))
                i += 1
                continue
                
            if line.strip().startswith('>'):
                if in_list:
                    html_lines.append(self._format_list(list_content))
                    list_content = []
                    in_list = False
                quote_lines = [line]
                i += 1
                while i < len(lines) and (lines[i].strip().startswith('>') or lines[i].strip() == ''):
                    if lines[i].strip() == '' and i + 1 < len(lines) and not lines[i + 1].strip().startswith('>'):
                        break
                    quote_lines.append(lines[i])
                    i += 1
                html_lines.append(self._format_quote(quote_lines))
                continue
                
            if re.match(r'^[\*\-\+] ', line.strip()) or re.match(r'^\d+\. ', line.strip()):
                in_list = True
                list_content.append(line)
                i += 1
                while i < len(lines):
                    next_line = lines[i]
                    if re.match(r'^[\*\-\+] ', next_line.strip()) or re.match(r'^\d+\. ', next_line.strip()):
                        list_content.append(next_line)
                        i += 1
                    elif next_line.strip() == '' and i + 1 < len(lines):
                        next_next = lines[i + 1]
                        if re.match(r'^[\*\-\+] ', next_next.strip()) or re.match(r'^\d+\. ', next_next.strip()):
                            list_content.append(next_line)
                            i += 1
                        else:
                            break
                    else:
                        break
                continue
                
            if in_list and line.strip() != '':
                list_content.append(line)
                i += 1
                continue
                
            if in_list:
                html_lines.append(self._format_list(list_content))
                list_content = []
                in_list = False
                
            if line.strip() == '':
                html_lines.append('<br>')
                i += 1
                continue
                
            html_lines.append(self._format_paragraph(line))
            i += 1
            
        if in_list:
            html_lines.append(self._format_list(list_content))
            
        if in_code_block and code_block_content:
            html_lines.append(self._format_code_block(code_block_content))
            
        html = '\n'.join(html_lines)
        return self._wrap_html(html)
        
    def _format_header(self, line):
        match = re.match(r'^(#{1,6}) (.*)$', line)
        if not match:
            return self._format_paragraph(line)
            
        level = len(match.group(1))
        text = match.group(2)
        
        anchor = self._generate_anchor(text)
        formatted_text = self._format_inline_elements(text)
        
        return f'<h{level} id="{anchor}">{formatted_text}</h{level}>'
        
    def _generate_anchor(self, text):
        anchor = text.lower()
        anchor = re.sub(r'[^a-z0-9\s\-]', '', anchor)
        anchor = anchor.replace(' ', '-')
        anchor = re.sub(r'-+', '-', anchor)
        return anchor
        
    def _format_paragraph(self, line):
        formatted = self._format_inline_elements(line)
        return f'<p>{formatted}</p>'
        
    def _format_inline_elements(self, text):
        text = re.sub(r'\*\*\*(.*?)\*\*\*', r'<strong><em>\1</em></strong>', text)
        
        text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'__(.*?)__', r'<strong>\1</strong>', text)
        
        text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
        text = re.sub(r'_(.*?)_', r'<em>\1</em>', text)
        
        text = re.sub(r'`([^`]+)`', r'<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace;">\1</code>', text)
        
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', self._replace_link, text)
        
        text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1" style="max-width: 100%;">', text)
        
        text = re.sub(r'~~(.*?)~~', r'<del>\1</del>', text)
        
        return text
        
    def _replace_link(self, match):
        text = match.group(1)
        url = match.group(2)
        
        if url.startswith('#'):
            anchor = url[1:]
            return f'<a href="#{anchor}" style="color: #0366d6; text-decoration: none;">{text}</a>'
        elif url.startswith('http://') or url.startswith('https://'):
            return f'<a href="{url}" style="color: #0366d6; text-decoration: none;">{text}</a>'
        else:
            return f'<a href="{url}" style="color: #0366d6; text-decoration: none;">{text}</a>'
            
    def _format_code_block(self, lines):
        if not lines:
            return ''
            
        content = '\n'.join(lines)
        content = content.replace('&', '&amp;')
        content = content.replace('<', '&lt;')
        content = content.replace('>', '&gt;')
        
        return f'''<pre style="background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto;">
<code style="font-family: Consolas, monospace; font-size: 14px;">{content}</code>
</pre>'''
        
    def _format_quote(self, lines):
        content = '\n'.join(line.lstrip('> ').lstrip('>') for line in lines)
        formatted = self._format_inline_elements(content.strip())
        return f'''<blockquote style="border-left: 4px solid #dfe2e5; margin: 0; padding: 0 16px; color: #6a737d;">
<p>{formatted}</p>
</blockquote>'''
        
    def _format_list(self, lines):
        if not lines:
            return ''
            
        first_line = lines[0].strip()
        is_ordered = bool(re.match(r'^\d+\. ', first_line))
        
        items = []
        current_item = []
        
        for line in lines:
            stripped = line.strip()
            if is_ordered:
                if re.match(r'^\d+\. ', stripped):
                    if current_item:
                        items.append(current_item)
                    current_item = [stripped]
                else:
                    current_item.append(line)
            else:
                if re.match(r'^[\*\-\+] ', stripped):
                    if current_item:
                        items.append(current_item)
                    current_item = [stripped]
                else:
                    current_item.append(line)
                    
        if current_item:
            items.append(current_item)
            
        html_items = []
        for item_lines in items:
            if not item_lines:
                continue
            first_line = item_lines[0].strip()
            if is_ordered:
                content = re.sub(r'^\d+\. ', '', first_line)
            else:
                content = re.sub(r'^[\*\-\+] ', '', first_line)
            formatted = self._format_inline_elements(content)
            html_items.append(f'<li>{formatted}</li>')
            
        tag = 'ol' if is_ordered else 'ul'
        return f'<{tag} style="margin: 16px 0; padding-left: 2em;">\n' + '\n'.join(html_items) + f'\n</{tag}>'
        
    def _wrap_html(self, body):
        return f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: "Microsoft YaHei", "Segoe UI", Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #24292e;
            padding: 20px;
            margin: 0;
            background-color: #ffffff;
        }}
        h1, h2, h3, h4, h5, h6 {{
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }}
        h1 {{ font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }}
        h2 {{ font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }}
        h3 {{ font-size: 1.25em; }}
        h4 {{ font-size: 1em; }}
        p {{ margin-top: 0; margin-bottom: 16px; }}
        a:hover {{ text-decoration: underline; }}
        pre {{ margin-bottom: 16px; }}
        code {{ font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }}
        blockquote {{ margin-bottom: 16px; }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }}
        th, td {{
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }}
        th {{ background-color: #f6f8fa; font-weight: 600; }}
        tr:nth-child(2n) {{ background-color: #f6f8fa; }}
        hr {{
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #e1e4e8;
            border: 0;
        }}
    </style>
</head>
<body>
{body}
</body>
</html>
'''
        
    def _on_anchor_clicked(self, url):
        if url.scheme() == '':
            anchor = url.toString()
            if anchor.startswith('#'):
                anchor = anchor[1:]
            self.anchor_clicked.emit(anchor)
        else:
            QDesktopServices.openUrl(url)
