import { useState } from 'react';
import { FileText, Download, Upload, File, Video, Search, Filter } from 'lucide-react';

interface Resource {
  id: string;
  courseTitle: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'doc' | 'video' | 'other';
  fileSize: string;
  uploadedAt: string;
  downloadUrl: string;
}

export default function ResourcesSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const mockResources: Resource[] = [
    {
      id: '1',
      courseTitle: 'Introduction to Python Programming',
      title: 'Python Basics Cheat Sheet',
      description: 'Quick reference guide for Python syntax and common functions',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      uploadedAt: '2 days ago',
      downloadUrl: '#',
    },
    {
      id: '2',
      courseTitle: 'Machine Learning Fundamentals',
      title: 'Linear Regression Tutorial',
      description: 'Step-by-step guide to implementing linear regression',
      fileType: 'pdf',
      fileSize: '3.1 MB',
      uploadedAt: '1 week ago',
      downloadUrl: '#',
    },
    {
      id: '3',
      courseTitle: 'Machine Learning Fundamentals',
      title: 'ML Algorithms Explained',
      description: 'Video lecture covering popular ML algorithms',
      fileType: 'video',
      fileSize: '125 MB',
      uploadedAt: '1 week ago',
      downloadUrl: '#',
    },
    {
      id: '4',
      courseTitle: 'Microsoft Excel Mastery',
      title: 'Excel Formulas Guide',
      description: 'Comprehensive guide to Excel formulas and functions',
      fileType: 'doc',
      fileSize: '1.8 MB',
      uploadedAt: '2 weeks ago',
      downloadUrl: '#',
    },
    {
      id: '5',
      courseTitle: 'Web Development with React',
      title: 'React Components Examples',
      description: 'Sample code for common React components',
      fileType: 'other',
      fileSize: '0.5 MB',
      uploadedAt: '3 weeks ago',
      downloadUrl: '#',
    },
  ];

  const fileTypes = ['all', 'pdf', 'doc', 'video', 'other'];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'doc':
        return <File className="w-6 h-6 text-blue-500" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-500" />;
      default:
        return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  const getFileTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'doc':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'video':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.fileType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Course Resources</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
            >
              {fileTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Upload Your Work</p>
              <p className="text-sm text-slate-600">Submit assignments and homework</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            Upload
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {getFileIcon(resource.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-800 truncate">
                      {resource.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${getFileTypeBadgeColor(
                        resource.fileType
                      )}`}
                    >
                      {resource.fileType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {resource.courseTitle}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{resource.fileSize}</span>
                    <span>•</span>
                    <span>Added {resource.uploadedAt}</span>
                  </div>
                </div>
              </div>
              <button className="ml-4 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No resources found</p>
        </div>
      )}
    </div>
  );
}
