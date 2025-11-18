
import React, { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { Node, Category, NewNodeData } from '../types';

interface NodeFormProps {
  allNodes: Node[];
  onAddNode: (nodeData: NewNodeData) => void;
}

const NodeForm: React.FC<NodeFormProps> = ({ allNodes, onAddNode }) => {
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<number>(1);
  const [parentIds, setParentIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const maxPhase = useMemo(() => {
    if (allNodes.length === 0) return 1;
    return Math.max(...allNodes.map(n => n.phase)) + 1;
  }, [allNodes]);

  const availableParents = useMemo(() => {
    return allNodes.filter(node => node.phase < phase);
  }, [allNodes, phase]);

  const handlePhaseChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newPhase = parseInt(e.target.value, 10);
    setPhase(newPhase);
    setParentIds([]); // Reset parents when phase changes
    if (newPhase === 1) {
      setCategories([]);
    }
  };

  const handleParentToggle = (parentId: string) => {
    setParentIds(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };
  
  const handleCategoryToggle = (cat: Category) => {
    setCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Node name cannot be empty.");
      return;
    }
    
    if (allNodes.some(node => node.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      alert("A node with this name already exists. Please use a unique name.");
      return;
    }
    
    const nodeData: NewNodeData = {
      name: name.trim(),
      phase,
      parentIds: phase > 1 ? parentIds : [],
      categories: phase > 1 ? categories : [],
    };

    onAddNode(nodeData);

    // Reset form
    setName('');
    setPhase(1);
    setParentIds([]);
    setCategories([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg sticky top-8">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Add New Node</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="node-name" className="block text-sm font-medium text-slate-600">Node Name</label>
          <input
            id="node-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Initial Research"
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="node-phase" className="block text-sm font-medium text-slate-600">Phase</label>
          <select
            id="node-phase"
            value={phase}
            onChange={handlePhaseChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {Array.from({ length: maxPhase }, (_, i) => i + 1).map(p => (
              <option key={p} value={p}>Phase {p}</option>
            ))}
          </select>
        </div>

        {phase > 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-600">Parent Nodes (optional)</label>
              <div className="mt-2 max-h-36 overflow-y-auto rounded-md border border-slate-300 p-2 space-y-2 bg-slate-50">
                {availableParents.length > 0 ? (
                  availableParents.map(p => (
                    <div key={p.id} className="flex items-center p-1 rounded-md hover:bg-slate-200 transition-colors">
                      <input
                        id={`parent-${p.id}`}
                        type="checkbox"
                        checked={parentIds.includes(p.id)}
                        onChange={() => handleParentToggle(p.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`parent-${p.id}`} className="ml-2 block text-sm text-slate-700 cursor-pointer w-full">
                        {p.name} <span className="text-slate-500 text-xs">(Phase {p.phase})</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-sm text-slate-500 text-center">No available parents in previous phases</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">Category (optional)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.values(Category).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      categories.includes(cat)
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Add Node
        </button>
      </form>
    </div>
  );
};

export default NodeForm;
