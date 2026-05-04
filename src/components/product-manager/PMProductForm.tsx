import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductActions } from '@/hooks/useProductActions';
import {
  Package, Save, X, Sparkles, Loader2, Plus, Trash2, Upload, MonitorPlay,
  Image as ImageIcon, FileArchive, Search as SearchIcon, Settings2, Tag, Link2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}
interface Demo { id: string; title: string; url: string; status: string; }
interface PMProductFormProps {
  productId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

type FormState = {
  product_name: string;
  slug: string;
  product_type: string;
  description: string;
  short_description: string;
  business_category_id: string;
  subcategory_id: string;
  pricing_model: string;
  lifetime_price: number;
  monthly_price: number;
  discount_price: number;
  status: string;
  features: string[];
  tags: string[];
  demo_ids: string[];
  thumbnail_url: string;
  gallery_urls: string[];
  preview_urls: string[];
  video_thumbnail_url: string;
  main_file_url: string;
  version: string;
  changelog: string;
  demo_type: string;
  demo_url: string;
  demo_embed: string;
  demo_video_url: string;
  demo_credentials: { username: string; password: string };
  documentation_url: string;
  support_url: string;
  blog_url: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  is_featured: boolean;
  is_free: boolean;
  is_subscription: boolean;
  trending: boolean;
  verified_author: boolean;
  license_type: string;
  license_tier: string;
  compatibility: string[];
  difficulty_level: string;
  industry_tags: string[];
  tech_stack_tags: string[];
  use_case_tags: string[];
  feature_list: string[];
  requirements: string;
  installation_guide: string;
  release_notes: string;
  search_keywords: string[];
  synonyms: string[];
  coupon_code: string;
  support_response_time: string;
  manual_rank: number;
  featured_rank: number;
};

const INITIAL: FormState = {
  product_name: '', slug: '', product_type: 'software', description: '', short_description: '',
  business_category_id: '', subcategory_id: '',
  pricing_model: 'one_time', lifetime_price: 0, monthly_price: 0, discount_price: 0,
  status: 'draft', features: [], tags: [], demo_ids: [],
  thumbnail_url: '', gallery_urls: [], preview_urls: [], video_thumbnail_url: '',
  main_file_url: '', version: 'v1.0', changelog: '',
  demo_type: 'live', demo_url: '', demo_embed: '', demo_video_url: '',
  demo_credentials: { username: '', password: '' },
  documentation_url: '', support_url: '', blog_url: '',
  meta_title: '', meta_description: '', keywords: [],
  og_title: '', og_description: '', og_image: '', canonical_url: '',
  is_featured: false, is_free: false, is_subscription: false, trending: false, verified_author: false,
  license_type: 'standard', license_tier: 'basic', compatibility: [],
  difficulty_level: 'basic', industry_tags: [], tech_stack_tags: [], use_case_tags: [],
  feature_list: [], requirements: '', installation_guide: '', release_notes: '',
  search_keywords: [], synonyms: [], coupon_code: '', support_response_time: '',
  manual_rank: 0, featured_rank: 0,
};

const PMProductForm: React.FC<PMProductFormProps> = ({ productId, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [formData, setFormData] = useState<FormState>(INITIAL);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const { aiAutoDescribe, aiSuggestFeatures, actionState } = useProductActions();
  const fileRefs = {
    thumb: useRef<HTMLInputElement>(null),
    gallery: useRef<HTMLInputElement>(null),
    preview: useRef<HTMLInputElement>(null),
    main: useRef<HTMLInputElement>(null),
    og: useRef<HTMLInputElement>(null),
  };

  useEffect(() => { fetchCategories(); fetchDemos(); if (productId) fetchProduct(); }, [productId]);
  useEffect(() => {
    if (!slugTouched && !productId) {
      setFormData(p => ({ ...p, slug: slugify(p.product_name) }));
    }
  }, [formData.product_name, slugTouched, productId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*, subcategories:business_subcategories(id, name)')
      .eq('is_active', true)
      .order('display_order');
    if (error) toast.error('Could not load categories');
    if (data) setCategories(data);
  };
  const fetchDemos = async () => {
    const { data } = await supabase.from('demos').select('id, title, url, status').eq('status','active').order('title');
    if (data) setDemos(data as Demo[]);
  };
  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, demo_mappings:product_demo_mappings(demo_id)')
      .eq('product_id', productId).single();
    if (data) {
      const d: any = data;
      setFormData({
        ...INITIAL,
        product_name: d.product_name || '',
        slug: d.slug || '',
        product_type: d.product_type || 'software',
        description: d.description || '',
        short_description: d.short_description || '',
        business_category_id: d.business_category_id || '',
        subcategory_id: d.subcategory_id || '',
        pricing_model: d.pricing_model || 'one_time',
        lifetime_price: Number(d.lifetime_price) || 0,
        monthly_price: Number(d.monthly_price) || 0,
        discount_price: Number(d.discount_price) || 0,
        status: d.status || 'draft',
        features: Array.isArray(d.features_json) ? d.features_json.map(String) : [],
        tags: d.tags || [],
        demo_ids: d.demo_mappings?.map((m: any) => m.demo_id) || [],
        thumbnail_url: d.thumbnail_url || '',
        gallery_urls: d.gallery_urls || [],
        preview_urls: d.preview_urls || [],
        video_thumbnail_url: d.video_thumbnail_url || '',
        main_file_url: d.main_file_url || '',
        version: d.version || 'v1.0',
        changelog: d.changelog || '',
        demo_type: d.demo_type || 'live',
        demo_url: d.demo_url || '',
        demo_embed: d.demo_embed || '',
        demo_video_url: d.demo_video_url || '',
        demo_credentials: d.demo_credentials || { username: '', password: '' },
        documentation_url: d.documentation_url || '',
        support_url: d.support_url || '',
        blog_url: d.blog_url || '',
        meta_title: d.meta_title || '',
        meta_description: d.meta_description || '',
        keywords: d.keywords || [],
        og_title: d.og_title || '',
        og_description: d.og_description || '',
        og_image: d.og_image || '',
        canonical_url: d.canonical_url || '',
        is_featured: !!d.is_featured,
        is_free: !!d.is_free,
        is_subscription: !!d.is_subscription,
        trending: !!d.trending,
        verified_author: !!d.verified_author,
        license_type: d.license_type || 'standard',
        license_tier: d.license_tier || 'basic',
        compatibility: d.compatibility || [],
        difficulty_level: d.difficulty_level || 'basic',
        industry_tags: d.industry_tags || [],
        tech_stack_tags: d.tech_stack_tags || [],
        use_case_tags: d.use_case_tags || [],
        feature_list: d.feature_list || [],
        requirements: d.requirements || '',
        installation_guide: d.installation_guide || '',
        release_notes: d.release_notes || '',
        search_keywords: d.search_keywords || [],
        synonyms: d.synonyms || [],
        coupon_code: d.coupon_code || '',
        support_response_time: d.support_response_time || '',
        manual_rank: d.manual_rank || 0,
        featured_rank: d.featured_rank || 0,
      });
      setSlugTouched(true);
    }
    setLoading(false);
  };

  const uploadFile = async (file: File, bucket: 'product-images'|'product-files', key: string): Promise<string|null> => {
    setUploading(key);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      return pub.publicUrl;
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
      return null;
    } finally { setUploading(null); }
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadFile(f, 'product-images', 'thumb');
    if (url) setFormData({ ...formData, thumbnail_url: url });
  };
  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadFile(f, 'product-images', 'og');
    if (url) setFormData({ ...formData, og_image: url });
  };
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    const urls: string[] = [];
    for (const f of files) { const u = await uploadFile(f, 'product-images', 'gallery'); if (u) urls.push(u); }
    setFormData({ ...formData, gallery_urls: [...formData.gallery_urls, ...urls] });
  };
  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    const urls: string[] = [];
    for (const f of files) { const u = await uploadFile(f, 'product-images', 'preview'); if (u) urls.push(u); }
    setFormData({ ...formData, preview_urls: [...formData.preview_urls, ...urls] });
  };
  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadFile(f, 'product-files', 'main');
    if (url) setFormData({ ...formData, main_file_url: url });
  };

  const validate = (): string | null => {
    if (!formData.product_name.trim()) return 'Product name is required';
    if (!formData.slug.trim()) return 'Slug is required';
    if (!formData.business_category_id) return 'Main category is required';
    if (formData.lifetime_price < 0 || formData.monthly_price < 0) return 'Price cannot be negative';
    if (formData.status === 'active') {
      if (!formData.main_file_url && !formData.is_subscription) return 'Main product file required to publish';
      if (!formData.demo_url && !formData.demo_embed && !formData.demo_video_url) return 'Demo required to publish';
    }
    return null;
  };

  const handleSave = async (overrideStatus?: string) => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const productData: any = {
        product_name: formData.product_name,
        slug: formData.slug,
        product_type: formData.product_type,
        description: formData.description,
        short_description: formData.short_description,
        business_category_id: formData.business_category_id || null,
        subcategory_id: formData.subcategory_id || null,
        pricing_model: formData.pricing_model,
        lifetime_price: formData.lifetime_price,
        monthly_price: formData.monthly_price,
        discount_price: formData.discount_price || null,
        status: overrideStatus || formData.status,
        features_json: formData.features,
        tags: formData.tags,
        thumbnail_url: formData.thumbnail_url,
        gallery_urls: formData.gallery_urls,
        preview_urls: formData.preview_urls,
        video_thumbnail_url: formData.video_thumbnail_url,
        main_file_url: formData.main_file_url,
        version: formData.version,
        changelog: formData.changelog,
        demo_type: formData.demo_type,
        demo_url: formData.demo_url,
        demo_embed: formData.demo_embed,
        demo_video_url: formData.demo_video_url,
        demo_credentials: formData.demo_credentials,
        documentation_url: formData.documentation_url,
        support_url: formData.support_url,
        blog_url: formData.blog_url,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        keywords: formData.keywords,
        og_title: formData.og_title,
        og_description: formData.og_description,
        og_image: formData.og_image,
        canonical_url: formData.canonical_url,
        is_featured: formData.is_featured,
        is_free: formData.is_free,
        is_subscription: formData.is_subscription,
        trending: formData.trending,
        verified_author: formData.verified_author,
        license_type: formData.license_type,
        license_tier: formData.license_tier,
        compatibility: formData.compatibility,
        difficulty_level: formData.difficulty_level,
        industry_tags: formData.industry_tags,
        tech_stack_tags: formData.tech_stack_tags,
        use_case_tags: formData.use_case_tags,
        feature_list: formData.feature_list,
        requirements: formData.requirements,
        installation_guide: formData.installation_guide,
        release_notes: formData.release_notes,
        search_keywords: formData.search_keywords,
        synonyms: formData.synonyms,
        coupon_code: formData.coupon_code,
        support_response_time: formData.support_response_time,
        manual_rank: formData.manual_rank,
        featured_rank: formData.featured_rank,
        last_updated_at: new Date().toISOString(),
      };

      let savedId = productId;
      if (productId) {
        const { error } = await supabase.from('products').update(productData).eq('product_id', productId);
        if (error) throw error;
        await supabase.from('product_demo_mappings').delete().eq('product_id', productId);
        if (formData.demo_ids.length > 0) {
          await supabase.from('product_demo_mappings').insert(
            formData.demo_ids.map(demo_id => ({ product_id: productId, demo_id }))
          );
        }
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        savedId = newProduct.product_id;
        if (formData.demo_ids.length > 0) {
          await supabase.from('product_demo_mappings').insert(
            formData.demo_ids.map(demo_id => ({ product_id: newProduct.product_id, demo_id }))
          );
        }
      }

      await supabase.from('product_action_logs').insert([{
        product_id: savedId,
        product_name: formData.product_name,
        action: productId ? 'product_updated' : 'product_created',
        action_details: { slug: formData.slug, status: productData.status },
      }]);

      toast.success(productId ? 'Product updated' : 'Product created');
      onSave();
    } catch (error: any) {
      toast.error('Failed to save product: ' + error.message);
    } finally { setLoading(false); }
  };

  const handleAIDescribe = async () => {
    const description = await aiAutoDescribe(formData.product_name, formData.features);
    if (description) setFormData({ ...formData, description });
  };
  const handleAISuggestFeatures = async () => {
    const suggestions = await aiSuggestFeatures(formData.product_type);
    if (suggestions.length > 0) setFormData({ ...formData, features: [...formData.features, ...suggestions] });
  };

  const addToList = (key: keyof FormState, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [key]: [...(formData[key] as string[]), value.trim()] } as FormState);
    setter('');
  };
  const removeFromList = (key: keyof FormState, idx: number) => {
    setFormData({ ...formData, [key]: (formData[key] as string[]).filter((_, i) => i !== idx) } as FormState);
  };

  const selectedCategory = categories.find(c => c.id === formData.business_category_id);
  const subcategories = selectedCategory?.subcategories || [];

  const renderChips = (items: string[], onRemove: (i: number) => void) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Badge key={i} variant="secondary" className="gap-1.5">
          {item}
          <button onClick={() => onRemove(i)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            {productId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete product details — SEO, media, demo, files and more
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />Save Draft
          </Button>
          <Button onClick={() => handleSave()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {productId ? 'Update' : 'Add Product'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* BASIC */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Title *</label>
                <Input value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} placeholder="Enter product title" />
              </div>
              <div>
                <label className="text-sm font-medium">Slug * (URL friendly)</label>
                <Input value={formData.slug} onChange={(e) => { setSlugTouched(true); setFormData({ ...formData, slug: slugify(e.target.value) }); }} placeholder="product-slug" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Type</label>
                  <Select value={formData.product_type} onValueChange={(v) => setFormData({ ...formData, product_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="active">Publish</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="parked">Parked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Main Category *</label>
                  <Select value={formData.business_category_id} onValueChange={(v) => setFormData({ ...formData, business_category_id: v, subcategory_id: '' })}>
                    <SelectTrigger><SelectValue placeholder={categories.length ? "Select category" : "Loading..."} /></SelectTrigger>
                    <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sub Category</label>
                  <Select value={formData.subcategory_id} onValueChange={(v) => setFormData({ ...formData, subcategory_id: v })} disabled={!formData.business_category_id}>
                    <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
                    <SelectContent>{subcategories.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Short Description</label>
                <Textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} placeholder="One-line summary used on cards/listings" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Description</label>
                  <Button variant="ghost" size="sm" onClick={handleAIDescribe} disabled={actionState.loading || !formData.product_name}>
                    <Sparkles className="w-3 h-3 mr-1" />AI Generate
                  </Button>
                </div>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} placeholder="Full product description (markdown supported)" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1"><Tag className="w-3 h-3" />Tags</label>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('tags', newTag, setNewTag))} placeholder="Add a tag" />
                  <Button onClick={() => addToList('tags', newTag, setNewTag)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="mt-2">{renderChips(formData.tags, (i) => removeFromList('tags', i))}</div>
              </div>
            </CardContent>
          </Card>

          <Card><CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Features</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleAISuggestFeatures} disabled={actionState.loading}>
              <Sparkles className="w-3 h-3 mr-1" />AI Suggest
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Add a feature" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('features', newFeature, setNewFeature))} />
              <Button onClick={() => addToList('features', newFeature, setNewFeature)}><Plus className="w-4 h-4" /></Button>
            </div>
            {renderChips(formData.features, (i) => removeFromList('features', i))}
          </CardContent></Card>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" />Thumbnail</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {formData.thumbnail_url && <img src={formData.thumbnail_url} alt="thumb" className="w-40 h-40 object-cover rounded-lg border" />}
            <input ref={fileRefs.thumb} type="file" accept="image/*" hidden onChange={handleThumbUpload} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileRefs.thumb.current?.click()} disabled={uploading==='thumb'}>
                {uploading==='thumb' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {formData.thumbnail_url ? 'Replace Thumbnail' : 'Upload Thumbnail'}
              </Button>
              {formData.thumbnail_url && <Button variant="ghost" onClick={() => setFormData({ ...formData, thumbnail_url: '' })}><Trash2 className="w-4 h-4" /></Button>}
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Gallery Images</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {formData.gallery_urls.map((u, i) => (
                <div key={i} className="relative group">
                  <img src={u} alt="" className="w-full h-24 object-cover rounded border" />
                  <button onClick={() => setFormData({ ...formData, gallery_urls: formData.gallery_urls.filter((_, x) => x !== i) })}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileRefs.gallery} type="file" accept="image/*" multiple hidden onChange={handleGalleryUpload} />
            <Button variant="outline" onClick={() => fileRefs.gallery.current?.click()} disabled={uploading==='gallery'}>
              {uploading==='gallery' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Add Images
            </Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Preview Screenshots</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {formData.preview_urls.map((u, i) => (
                <div key={i} className="relative group">
                  <img src={u} alt="" className="w-full h-24 object-cover rounded border" />
                  <button onClick={() => setFormData({ ...formData, preview_urls: formData.preview_urls.filter((_, x) => x !== i) })}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileRefs.preview} type="file" accept="image/*" multiple hidden onChange={handlePreviewUpload} />
            <Button variant="outline" onClick={() => fileRefs.preview.current?.click()} disabled={uploading==='preview'}>
              {uploading==='preview' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Add Preview
            </Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Video Thumbnail URL</CardTitle></CardHeader>
          <CardContent>
            <Input value={formData.video_thumbnail_url} onChange={(e) => setFormData({ ...formData, video_thumbnail_url: e.target.value })} placeholder="https://..." />
          </CardContent></Card>
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileArchive className="w-4 h-4" />Main Product File</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {formData.main_file_url && <p className="text-xs text-muted-foreground break-all">{formData.main_file_url}</p>}
            <input ref={fileRefs.main} type="file" hidden onChange={handleMainFileUpload} accept=".zip,.rar,.tar,.gz,.7z" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileRefs.main.current?.click()} disabled={uploading==='main'}>
                {uploading==='main' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {formData.main_file_url ? 'Replace File' : 'Upload Zip'}
              </Button>
              {formData.main_file_url && <Button variant="ghost" onClick={() => setFormData({ ...formData, main_file_url: '' })}><Trash2 className="w-4 h-4" /></Button>}
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Version & Changelog</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Version</label>
              <Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="v1.0" />
            </div>
            <div>
              <label className="text-sm font-medium">Changelog</label>
              <Textarea value={formData.changelog} onChange={(e) => setFormData({ ...formData, changelog: e.target.value })} rows={4} placeholder="What changed in this version" />
            </div>
            <div>
              <label className="text-sm font-medium">Release Notes (Public)</label>
              <Textarea value={formData.release_notes} onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })} rows={3} />
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" />Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Documentation URL</label>
              <Input value={formData.documentation_url} onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })} placeholder="https://docs..." />
            </div>
            <div>
              <label className="text-sm font-medium">Support URL</label>
              <Input value={formData.support_url} onChange={(e) => setFormData({ ...formData, support_url: e.target.value })} placeholder="https://support..." />
            </div>
            <div>
              <label className="text-sm font-medium">Blog/Article URL</label>
              <Input value={formData.blog_url} onChange={(e) => setFormData({ ...formData, blog_url: e.target.value })} placeholder="https://blog..." />
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* DEMO */}
        <TabsContent value="demo" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MonitorPlay className="w-4 h-4" />Demo Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Demo Type</label>
              <Select value={formData.demo_type} onValueChange={(v) => setFormData({ ...formData, demo_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live Demo (URL)</SelectItem>
                  <SelectItem value="iframe">Iframe Embed</SelectItem>
                  <SelectItem value="video">Video Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Demo URL</label>
              <Input value={formData.demo_url} onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })} placeholder="https://demo.example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Iframe Embed URL</label>
              <Input value={formData.demo_embed} onChange={(e) => setFormData({ ...formData, demo_embed: e.target.value })} placeholder="https://embed..." />
            </div>
            <div>
              <label className="text-sm font-medium">Demo Video URL</label>
              <Input value={formData.demo_video_url} onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })} placeholder="https://youtube.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Demo Username</label>
                <Input value={formData.demo_credentials.username} onChange={(e) => setFormData({ ...formData, demo_credentials: { ...formData.demo_credentials, username: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium">Demo Password</label>
                <Input value={formData.demo_credentials.password} onChange={(e) => setFormData({ ...formData, demo_credentials: { ...formData.demo_credentials, password: e.target.value } })} />
              </div>
            </div>

            {(formData.demo_url || formData.demo_embed || formData.demo_video_url) && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-medium mb-2">Live Preview</p>
                {formData.demo_type === 'iframe' && formData.demo_embed ? (
                  <iframe src={formData.demo_embed} className="w-full h-64 rounded border" title="demo" />
                ) : formData.demo_type === 'video' && formData.demo_video_url ? (
                  <a href={formData.demo_video_url} target="_blank" rel="noreferrer" className="text-primary text-sm underline">Open Video ↗</a>
                ) : formData.demo_url ? (
                  <a href={formData.demo_url} target="_blank" rel="noreferrer" className="text-primary text-sm underline">Open Demo ↗</a>
                ) : null}
              </div>
            )}
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Linked Demo Records</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-40 border rounded-lg p-3">
              {demos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active demos available</p>
              ) : (
                <div className="space-y-2">
                  {demos.map(demo => (
                    <label key={demo.id} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded cursor-pointer">
                      <Checkbox checked={formData.demo_ids.includes(demo.id)} onCheckedChange={(checked) => {
                        if (checked) setFormData({ ...formData, demo_ids: [...formData.demo_ids, demo.id] });
                        else setFormData({ ...formData, demo_ids: formData.demo_ids.filter(id => id !== demo.id) });
                      }} />
                      <div className="flex-1"><p className="text-sm font-medium">{demo.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{demo.url}</p></div>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent></Card>
        </TabsContent>

        {/* PRICING */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Pricing & Plans</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 border rounded-lg">
              <div><p className="text-sm font-medium">Free Product</p><p className="text-xs text-muted-foreground">Mark this product as free</p></div>
              <Switch checked={formData.is_free} onCheckedChange={(v) => setFormData({ ...formData, is_free: v })} />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 border rounded-lg">
              <div><p className="text-sm font-medium">Subscription / SaaS</p></div>
              <Switch checked={formData.is_subscription} onCheckedChange={(v) => setFormData({ ...formData, is_subscription: v })} />
            </div>
            <div>
              <label className="text-sm font-medium">Pricing Model</label>
              <Select value={formData.pricing_model} onValueChange={(v) => setFormData({ ...formData, pricing_model: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-Time</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="tier_based">Tier-Based</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Lifetime Price (USD)</label>
                <Input type="number" min={0} value={formData.lifetime_price || ''} onChange={(e) => setFormData({ ...formData, lifetime_price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Monthly Price (USD)</label>
                <Input type="number" min={0} value={formData.monthly_price || ''} onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Price</label>
                <Input type="number" min={0} value={formData.discount_price || ''} onChange={(e) => setFormData({ ...formData, discount_price: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">License Type</label>
                <Select value={formData.license_type} onValueChange={(v) => setFormData({ ...formData, license_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">License Tier</label>
                <Select value={formData.license_tier} onValueChange={(v) => setFormData({ ...formData, license_tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Coupon Code</label>
              <Input value={formData.coupon_code} onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })} placeholder="LAUNCH20" />
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><SearchIcon className="w-4 h-4" />SEO</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} maxLength={60} />
              <p className="text-xs text-muted-foreground mt-1">{formData.meta_title.length}/60</p>
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} maxLength={160} rows={2} />
              <p className="text-xs text-muted-foreground mt-1">{formData.meta_description.length}/160</p>
            </div>
            <div>
              <label className="text-sm font-medium">Keywords (#tag system)</label>
              <div className="flex gap-2">
                <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('keywords', newKeyword, setNewKeyword))} placeholder="Add keyword" />
                <Button onClick={() => addToList('keywords', newKeyword, setNewKeyword)}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="mt-2">{renderChips(formData.keywords, (i) => removeFromList('keywords', i))}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Canonical URL</label>
              <Input value={formData.canonical_url} onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">OpenGraph (Social)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">OG Title</label>
              <Input value={formData.og_title} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">OG Description</label>
              <Textarea value={formData.og_description} onChange={(e) => setFormData({ ...formData, og_description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">OG Image</label>
              {formData.og_image && <img src={formData.og_image} alt="og" className="w-40 h-24 object-cover rounded border my-2" />}
              <input ref={fileRefs.og} type="file" accept="image/*" hidden onChange={handleOgUpload} />
              <div>
                <Button variant="outline" size="sm" onClick={() => fileRefs.og.current?.click()} disabled={uploading==='og'}>
                  {uploading==='og' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload OG Image
                </Button>
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* CONTENT */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm">Requirements</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder="System requirements, dependencies..." />
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Installation Guide</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={5} value={formData.installation_guide} onChange={(e) => setFormData({ ...formData, installation_guide: e.target.value })} placeholder="Step by step installation" />
          </CardContent></Card>
        </TabsContent>

        {/* ADVANCED */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings2 className="w-4 h-4" />Positioning & Flags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'is_featured', label: 'Featured' },
                { key: 'trending', label: 'Trending' },
                { key: 'verified_author', label: 'Verified Author' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                  <p className="text-sm font-medium">{label}</p>
                  <Switch checked={(formData as any)[key]} onCheckedChange={(v) => setFormData({ ...formData, [key]: v } as FormState)} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Featured Rank</label>
                <Input type="number" value={formData.featured_rank || ''} onChange={(e) => setFormData({ ...formData, featured_rank: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Manual Rank</label>
                <Input type="number" value={formData.manual_rank || ''} onChange={(e) => setFormData({ ...formData, manual_rank: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select value={formData.difficulty_level} onValueChange={(v) => setFormData({ ...formData, difficulty_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Support Response Time</label>
              <Input value={formData.support_response_time} onChange={(e) => setFormData({ ...formData, support_response_time: e.target.value })} placeholder="e.g. within 24 hours" />
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-sm">Filter Tags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([
              ['compatibility','Compatibility (OS/Browser)'],
              ['industry_tags','Industry Tags'],
              ['tech_stack_tags','Tech Stack Tags'],
              ['use_case_tags','Use-case Tags'],
              ['search_keywords','Hidden Search Keywords'],
              ['synonyms','Synonyms / Alt Keywords'],
            ] as const).map(([key,label]) => (
              <ListEditor key={key} label={label} items={(formData as any)[key]}
                onAdd={(v) => setFormData({ ...formData, [key]: [ ...((formData as any)[key]||[]), v ] } as FormState)}
                onRemove={(i) => setFormData({ ...formData, [key]: (((formData as any)[key]||[]) as string[]).filter((_,x)=>x!==i) } as FormState)} />
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ListEditor: React.FC<{ label: string; items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void }> = ({ label, items, onAdd, onRemove }) => {
  const [v, setV] = useState('');
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 mt-1">
        <Input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(''); } } }} placeholder={`Add ${label.toLowerCase()}`} />
        <Button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(''); } }}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {(items||[]).map((it, i) => (
          <Badge key={i} variant="secondary" className="gap-1.5">{it}<button onClick={() => onRemove(i)} className="hover:text-destructive"><X className="w-3 h-3" /></button></Badge>
        ))}
      </div>
    </div>
  );
};

export default PMProductForm;
