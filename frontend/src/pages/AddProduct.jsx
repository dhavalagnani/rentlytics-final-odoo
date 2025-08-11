import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { authAPI } from '../services/apiService';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    unitsAvailable: 1,
    depositAmount: '',
    baseRates: {
      hourly: '',
      daily: '',
      weekly: ''
    },
    rules: {
      minRentalHours: '',
      maxRentalDays: ''
    },
    images: [],
    availabilityBlocks: []
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/categories', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data.categories);
        } else {
          console.error('Failed to fetch categories:', data.message);
          // Fallback to mock categories
          setCategories([
            { _id: '1', name: 'Electronics' },
            { _id: '2', name: 'Tools & Equipment' },
            { _id: '3', name: 'Vehicles' },
            { _id: '4', name: 'Furniture' },
            { _id: '5', name: 'Sports Equipment' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock categories
        setCategories([
          { _id: '1', name: 'Electronics' },
          { _id: '2', name: 'Tools & Equipment' },
          { _id: '3', name: 'Vehicles' },
          { _id: '4', name: 'Furniture' },
                     { _id: '5', name: 'Sports Equipment' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== files.length) {
      toast.warning('⚠️ Some files were skipped. Only image files under 5MB are allowed.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    // Update formData images array
    setFormData(prev => ({
      ...prev,
      images: selectedFiles.filter((_, i) => i !== index)
    }));
  };

  const addAvailabilityBlock = () => {
    setFormData(prev => ({
      ...prev,
      availabilityBlocks: [
        ...prev.availabilityBlocks,
        { startDate: '', endDate: '', reason: '' }
      ]
    }));
  };

  const removeAvailabilityBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilityBlocks: prev.availabilityBlocks.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilityBlocks: prev.availabilityBlocks.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.categoryId) {
        const errorMsg = 'Please fill in all required fields';
        toast.error(`❌ ${errorMsg}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        throw new Error(errorMsg);
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('unitsAvailable', formData.unitsAvailable);
      formDataToSend.append('depositAmount', formData.depositAmount || 0);
      
      // Add nested objects as JSON strings
      formDataToSend.append('baseRates', JSON.stringify(formData.baseRates));
      formDataToSend.append('rules', JSON.stringify(formData.rules));
      formDataToSend.append('availabilityBlocks', JSON.stringify(formData.availabilityBlocks));
      
      // Add image file if selected
      if (selectedFiles.length > 0) {
        formDataToSend.append('image', selectedFiles[0]);
      }

      // Make API call
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (data.ok) {
        // Show success toast notification
        toast.success('🎉 Product added successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        setMessage({ type: 'success', text: 'Product added successfully!' });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          unitsAvailable: 1,
          depositAmount: '',
          baseRates: { hourly: '', daily: '', weekly: '' },
          rules: { minRentalHours: '', maxRentalDays: '' },
          images: [],
          availabilityBlocks: []
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        throw new Error(data.message || 'Failed to create product');
      }
      
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Show error toast notification
      toast.error(`❌ ${error.message || 'Failed to create product'}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setMessage({ type: 'error', text: error.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Product</h1>
            <p className="text-ink-muted mt-2">Create a new rental product listing</p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`card p-4 ${message.type === 'success' ? 'border-success/50' : 'border-danger/50'}`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="input"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Units Available</label>
                <input
                  type="number"
                  name="unitsAvailable"
                  value={formData.unitsAvailable}
                  onChange={handleInputChange}
                  className="input"
                  min="1"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Deposit Amount (₹)</label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="input"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-white mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input min-h-[100px] resize-none"
                placeholder="Describe your product..."
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={formData.baseRates.hourly}
                  onChange={(e) => handleNestedChange('baseRates', 'hourly', e.target.value)}
                  className="input"
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Daily Rate (₹)</label>
                <input
                  type="number"
                  value={formData.baseRates.daily}
                  onChange={(e) => handleNestedChange('baseRates', 'daily', e.target.value)}
                  className="input"
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Weekly Rate (₹)</label>
                <input
                  type="number"
                  value={formData.baseRates.weekly}
                  onChange={(e) => handleNestedChange('baseRates', 'weekly', e.target.value)}
                  className="input"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Rental Rules */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Rental Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Minimum Rental Hours</label>
                <input
                  type="number"
                  value={formData.rules.minRentalHours}
                  onChange={(e) => handleNestedChange('rules', 'minRentalHours', e.target.value)}
                  className="input"
                  min="1"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Maximum Rental Days</label>
                <input
                  type="number"
                  value={formData.rules.maxRentalDays}
                  onChange={(e) => handleNestedChange('rules', 'maxRentalDays', e.target.value)}
                  className="input"
                  min="1"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Product Images</h2>
            
            {/* File Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Upload Images (Max 5MB each, JPG, PNG, GIF)
              </label>
              <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:border-primary/60 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-ink-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-ink-muted">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-ink-muted">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Selected Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {selectedFiles[index]?.name || `Image ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Availability Blocks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Availability Blocks</h2>
              <button
                type="button"
                onClick={addAvailabilityBlock}
                className="btn btn-outline"
              >
                + Add Block
              </button>
            </div>
            
            {formData.availabilityBlocks.length === 0 ? (
              <p className="text-ink-muted text-sm">No availability blocks added. Product will be available all the time.</p>
            ) : (
              <div className="space-y-4">
                {formData.availabilityBlocks.map((block, index) => (
                  <div key={index} className="glass p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white">Block {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeAvailabilityBlock(index)}
                        className="btn btn-ghost text-danger"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                        <input
                          type="date"
                          value={block.startDate}
                          onChange={(e) => handleAvailabilityChange(index, 'startDate', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">End Date</label>
                        <input
                          type="date"
                          value={block.endDate}
                          onChange={(e) => handleAvailabilityChange(index, 'endDate', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Reason</label>
                        <input
                          type="text"
                          value={block.reason}
                          onChange={(e) => handleAvailabilityChange(index, 'reason', e.target.value)}
                          className="input"
                          placeholder="e.g., Maintenance, Vacation"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddProduct;
