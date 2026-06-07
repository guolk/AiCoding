import { useState } from "react";
import { ChevronDown, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  { id: 1, name: "西湖民宿改造项目" },
  { id: 2, name: "丽江古城民宿项目" },
  { id: 3, name: "厦门海边民宿项目" },
];

export default function Header() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-gray-900">
            {selectedProject.name}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-500 transition-transform",
              isDropdownOpen && "rotate-180"
            )}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                  selectedProject.id === project.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700"
                )}
              >
                {project.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            管
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">管理员</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
