import React, { useMemo } from 'react';
import { Node, Category } from '../types';

interface NodeCardProps {
  node: Node;
  allNodes: Node[];
}

const categoryColors: { [key in Category]: string } = {
  [Category.Strategy]: 'bg-blue-100 text-blue-800',
  [Category.Creation]: 'bg-green-100 text-green-800',
  [Category.Score]: 'bg-yellow-100 text-yellow-800',
};

const NodeCard: React.FC<NodeCardProps> = ({ node, allNodes }) => {
  const parents = useMemo(() => {
    return allNodes.filter(n => node.parentIds.includes(n.id));
  }, [node.parentIds, allNodes]);

  return (
    <div className="bg-white rounded-md shadow p-4 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-slate-800">{node.name}</h4>
      </div>

       {node.categories && node.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
            {node.categories.map(cat => (
              <span key={cat} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryColors[cat]}`}>
                {cat}
              </span>
            ))}
        </div>
      )}

      {parents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-1">Parents:</p>
          <ul className="text-sm text-slate-600 list-disc list-inside">
            {parents.map(parent => (
              <li key={parent.id} className="truncate" title={parent.name}>
                {parent.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NodeCard;