import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Target, TrendingUp, BarChart3, Upload, X, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { strategyService, imageService } from '../services/api';
import toast from 'react-hot-toast';

function CustomStrategies() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
    riskNotes: '',
    visibility: 'private' as 'private' | 'friends' | 'public',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const strategiesData = await strategyService.getStrategies();
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)
    );
    
    if (validFiles.length !== files.length) {
      alert('Only PNG, JPG, and JPEG files are allowed');
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    const saveStrategy = async () => {
      try {
        // Upload images
        const imageUrls = [];
        for (const image of selectedImages) {
          const url = await imageService.compressAndUpload(image);
          imageUrls.push(url);
        }
        
        const strategyData = {
          title: formData.title,
          body: formData.body,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          riskNotes: formData.riskNotes,
          visibility: formData.visibility,
          images: imageUrls,
        };
        
        if (editingStrategy) {
          const updated = await strategyService.updateStrategy(editingStrategy.id, strategyData);
          setStrategies(strategies.map(s => s.id === editingStrategy.id ? updated : s));
          toast.success('Strategy updated successfully!');
        } else {
          const newStrategy = await strategyService.createStrategy(strategyData);
          setStrategies([newStrategy, ...strategies]);
          toast.success('Strategy created successfully!');
        }
        
        resetForm();
      } catch (error) {
        console.error('Failed to save strategy:', error);
        toast.error('Failed to save strategy. Please try again.');
      } finally {
        setUploading(false);
      }
    };
    
    saveStrategy();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingStrategy(null);
    setFormData({
      title: '',
      body: '',
      tags: '',
      riskNotes: '',
      visibility: 'private',
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (strategy: any) => {
    setEditingStrategy(strategy);
    setFormData({
      title: strategy.title,
      body: strategy.body,
      tags: strategy.tags.join(', '),
      riskNotes: strategy.riskNotes || '',
      visibility: strategy.visibility,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      setStrategies(strategies.filter(s => s.id !== id));
      toast.success('Strategy deleted successfully!');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="w-4 h-4" />;
      case 'friends': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <EyeOff className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-400';
      case 'friends': return 'text-blue-400';
      case 'private': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/20 rounded-lg">
            <Target className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Custom Strategy</h1>
            <p className="text-primary-300">Create and manage your trading strategies</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gold-500 hover:bg-gold-600 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Strategy</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gold-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Total Strategies</p>
            <p className="text-white text-2xl font-bold">{strategies.length}</p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Public Strategies</p>
            <p className="text-success-400 text-2xl font-bold">
              {strategies.filter(s => s.visibility === 'public').length}
            </p>
          </div>
        </div>

        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gold-500/20 rounded-lg">
              <Target className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div>
            <p className="text-primary-300 text-sm">Private Strategies</p>
            <p className="text-gold-400 text-2xl font-bold">
              {strategies.filter(s => s.visibility === 'private').length}
            </p>
          </div>
        </div>
      </div>

      {/* Strategies List */}
      <div className="bg-primary-800 rounded-lg border border-primary-700">
        <div className="p-6 border-b border-primary-700">
          <h2 className="text-lg font-semibold text-white">Your Strategies</h2>
        </div>
        
        {strategies.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <p className="text-primary-400 mb-2">No strategies created yet</p>
            <p className="text-primary-500 text-sm">Create your first custom trading strategy</p>
          </div>
        ) : (
          <div className="divide-y divide-primary-700">
            {strategies.map((strategy: any) => (
              <div key={strategy.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{strategy.title}</h3>
                      <div className={`flex items-center space-x-1 ${getVisibilityColor(strategy.visibility)}`}>
                        {getVisibilityIcon(strategy.visibility)}
                        <span className="text-xs capitalize">{strategy.visibility}</span>
                      </div>
                    </div>
                    
                    <p className="text-primary-300 mb-3 line-clamp-2">{strategy.body}</p>
                    
                    {strategy.tags && strategy.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {strategy.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gold-500/20 text-gold-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {strategy.images && strategy.images.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {strategy.images.slice(0, 3).map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Strategy ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-primary-600"
                          />
                        ))}
                        {strategy.images.length > 3 && (
                          <div className="w-16 h-16 bg-primary-700 rounded border border-primary-600 flex items-center justify-center">
                            <span className="text-primary-400 text-xs">+{strategy.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-primary-400">
                      Created: {new Date(strategy.createdAt).toLocaleDateString()}
                      {strategy.updatedAt !== strategy.createdAt && (
                        <span> • Updated: {new Date(strategy.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(strategy)}
                      className="p-2 text-primary-400 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(strategy.id)}
                      className="p-2 text-primary-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Strategy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-800 rounded-lg border border-primary-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-700">
              <h3 className="text-lg font-semibold text-white">
                {editingStrategy ? 'Edit Strategy' : 'Add New Strategy'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Strategy Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Momentum Breakout"
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Strategy Details *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  rows={6}
                  placeholder="Describe your strategy in detail, including entry/exit rules, indicators used, market conditions..."
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="momentum, breakout, volume"
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Risk Notes
                </label>
                <textarea
                  value={formData.riskNotes}
                  onChange={(e) => setFormData({ ...formData, riskNotes: e.target.value })}
                  rows={3}
                  placeholder="Risk management rules, position sizing, stop loss guidelines..."
                  className="w-full px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Images (PNG, JPG, JPEG)
                </label>
                <div className="border-2 border-dashed border-primary-600 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-primary-400" />
                    <span className="text-primary-400">Click to upload images</span>
                    <span className="text-primary-500 text-xs">PNG, JPG, JPEG only</span>
                  </label>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-primary-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gold-500 hover:bg-gold-600 disabled:bg-primary-600 disabled:text-primary-400 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {uploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-900"></div>}
                  <span>{editingStrategy ? 'Update' : 'Create'} Strategy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomStrategies;

// Problem Solved:
// 1. Added proper JSX wrapping with parent div
// 2. Used className instead of class
// 3. Simplified component declaration
// 4. Added comments explaining fix