import React, { useState } from 'react';
import { Printer, Share2, Download, Copy, Check, Users, BookOpen, History, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Share: React.FC = () => {
  const { data } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'print'>('print');

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'family-history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getMemberById = (id: string) => data.members.find(m => m.id === id);

  const buildFamilyTree = () => {
    const rootMembers = data.members.filter(m => !m.parent);
    return rootMembers.map(member => buildTreeNode(member));
  };

  const buildTreeNode = (member: any) => {
    const spouse = member.spouse ? getMemberById(member.spouse) : null;
    const children = member.children.map((id: string) => getMemberById(id)).filter(Boolean);
    return {
      member,
      spouse,
      children: children.map((child: any) => buildTreeNode(child))
    };
  };

  const renderFamilyTreeNode = (node: any, level: number = 0) => {
    return (
      <div key={node.member.id} className="mb-4">
        <div className="bg-brown-50 p-4 rounded-lg border border-brown-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brown-200 flex items-center justify-center font-semibold text-brown-700">
              {node.member.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-brown-800">
                {node.member.name}
                {node.spouse && <span className="text-brown-500"> & {node.spouse.name}</span>}
              </h4>
              <p className="text-sm text-brown-600">
                {node.member.birthDate && `生于 ${node.member.birthDate}`}
                {node.member.deathDate && ` - 卒于 ${node.member.deathDate}`}
              </p>
              {node.member.occupation && (
                <p className="text-sm text-brown-600">{node.member.occupation}</p>
              )}
            </div>
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="ml-8 mt-4 border-l-2 border-brown-200 pl-4">
            {node.children.map((child: any) => renderFamilyTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const familyTree = buildFamilyTree();

  return (
    <div className="min-h-screen bg-warm-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-song text-brown-800 mb-2">分享</h1>
            <p className="text-brown-600">导出和分享您的家族历史</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyShareLink}
              className="bg-brown-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brown-700 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? '已复制' : '复制链接'}
            </button>
            <button
              onClick={exportFormat === 'json' ? handleExportJson : handlePrint}
              className="bg-white text-brown-700 border border-brown-300 px-4 py-2 rounded-lg shadow hover:bg-brown-50 transition-colors flex items-center gap-2"
            >
              {exportFormat === 'json' ? <Download className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
              {exportFormat === 'json' ? '导出 JSON' : '打印'}
            </button>
          </div>
        </div>

        <div className="flex bg-white rounded-lg shadow-sm p-1 mb-8">
          <button
            onClick={() => setExportFormat('print')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              exportFormat === 'print'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Printer className="w-5 h-5" />
            打印预览
          </button>
          <button
            onClick={() => setExportFormat('json')}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
              exportFormat === 'json'
                ? 'bg-brown-600 text-white'
                : 'text-brown-600 hover:bg-brown-50'
            }`}
          >
            <Download className="w-5 h-5" />
            JSON 导出
          </button>
        </div>

        {exportFormat === 'print' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center mb-8 pb-8 border-b border-brown-200">
                <h1 className="text-4xl font-bold font-song text-brown-800 mb-4">
                  王氏宗谱
                </h1>
                <p className="text-brown-600">
                  记录家族历史，传承家族精神
                </p>
              </div>

              <section className="mb-12">
                <h2 className="text-2xl font-bold font-song text-brown-800 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  家族成员
                </h2>
                <div className="space-y-4">
                  {familyTree.map(tree => renderFamilyTreeNode(tree))}
                </div>
              </section>

              {data.events.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold font-song text-brown-800 mb-6 flex items-center gap-2">
                    <History className="w-6 h-6" />
                    家族大事记
                  </h2>
                  <div className="space-y-4">
                    {data.events
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event) => (
                        <div key={event.id} className="border-l-4 border-brown-300 pl-4 py-2">
                          <h3 className="font-semibold text-brown-800">{event.title}</h3>
                          <p className="text-sm text-brown-500">{event.date}</p>
                          {event.location && (
                            <p className="text-sm text-brown-600">{event.location}</p>
                          )}
                          <p className="text-brown-700 mt-2">{event.description}</p>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {data.familyTraits.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold font-song text-brown-800 mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    家族精神
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.familyTraits.map((trait) => (
                      <div key={trait.id} className="bg-brown-50 p-6 rounded-lg border border-brown-200">
                        <h3 className="font-semibold text-brown-800 mb-2">{trait.title}</h3>
                        <p className="text-brown-700">{trait.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.researchNotes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold font-song text-brown-800 mb-6 flex items-center gap-2">
                    <Search className="w-6 h-6" />
                    数据考证
                  </h2>
                  <div className="space-y-4">
                    {data.researchNotes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3">
                        {note.confirmed ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-brown-800">{note.source}</p>
                          <p className="text-sm text-brown-600">
                            {note.sourceType === 'elder' ? '老人讲述' : '文献记载'}
                            {note.historicalSource && ` · ${note.historicalSource}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {exportFormat === 'json' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold font-song text-brown-800 mb-4">
              JSON 数据导出
            </h2>
            <p className="text-brown-600 mb-6">
              点击上方"导出 JSON"按钮，下载完整的家族历史数据。
            </p>
            <div className="bg-brown-50 rounded-lg p-6">
              <h3 className="font-semibold text-brown-800 mb-4">数据统计</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.members.length}</p>
                  <p className="text-sm text-brown-500">家族成员</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.events.length}</p>
                  <p className="text-sm text-brown-500">历史事件</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.oralHistories.length}</p>
                  <p className="text-sm text-brown-500">口述历史</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.photos.length}</p>
                  <p className="text-sm text-brown-500">照片存档</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.biographies.length}</p>
                  <p className="text-sm text-brown-500">个人传记</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.familyTraits.length}</p>
                  <p className="text-sm text-brown-500">家族精神</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.themeStories.length}</p>
                  <p className="text-sm text-brown-500">主题故事</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-600">{data.researchNotes.length}</p>
                  <p className="text-sm text-brown-500">考证记录</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
