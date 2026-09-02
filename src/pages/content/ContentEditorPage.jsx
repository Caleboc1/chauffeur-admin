import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DetailSkeleton from '@/components/ui/DetailSkeleton';
import styles from './ContentEditorPage.module.css';
import { ArrowLeft } from 'lucide-react';

export default function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contentItems, loading } = useContent();
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'faq',
    audience: 'both',
    body: '',
    status: 'draft'
  });

  const isNew = !id;

  useEffect(() => {
    if (!isNew && !loading && contentItems.length > 0) {
      const found = contentItems.find(c => c.id === id);
      if (found) {
        setFormData({
          title: found.title,
          content_type: found.content_type,
          audience: found.audience,
          body: found.body,
          status: found.status
        });
      }
    }
  }, [id, isNew, contentItems, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    navigate('/content');
  };

  if (loading) return <DetailSkeleton cards={1} />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Button variant="ghost" onClick={() => navigate('/content')}>
            <ArrowLeft size={20} /> Back
          </Button>
          <h1 className={styles.title}>{isNew ? 'Create Content' : 'Edit Content'}</h1>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate('/content')}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save changes</Button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.formSection}>
          <Input 
            label="Title"
            placeholder="Title"
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
          
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Content Type</label>
              <select name="content_type" value={formData.content_type} onChange={handleChange} className={styles.select}>
                <option value="terms_of_service">Terms of Service</option>
                <option value="privacy_policy">Privacy Policy</option>
                <option value="faq">FAQ</option>
                <option value="company_policy">Company Policy</option>
                <option value="marketing_copy">Marketing Copy</option>
              </select>
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Target Audience</label>
              <select name="audience" value={formData.audience} onChange={handleChange} className={styles.select}>
                <option value="rider">Rider</option>
                <option value="driver">Driver</option>
                <option value="both">Both</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={styles.select}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className={styles.editorBox}>
            <label className={styles.label}>Body Content</label>
            <textarea 
              name="body"
              value={formData.body}
              onChange={handleChange}
              className={styles.textarea}
              rows={20}
              placeholder="Rich text editor will be implemented here..."
            />
          </div>
        </div>

        {!isNew && (
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Version History</h2>
            <div className={styles.historyList}>
              <div className={styles.historyItem}>
                <span className={styles.historyVersion}>Version 3 (Current)</span>
                <span className={styles.historyDate}>Published May 10, 2024</span>
              </div>
              <div className={styles.historyItem}>
                <span className={styles.historyVersion}>Version 2</span>
                <span className={styles.historyDate}>Published April 1, 2024</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
