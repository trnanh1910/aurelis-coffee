import { Alert, Button, Spin } from 'antd';
import { ImagePlus, RotateCcw, ShieldCheck, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BrandLogo from '../../components/common/BrandLogo';
import { brandingService } from '../../services/brandingService';

async function optimizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / bitmap.width, 1400 / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Trình duyệt không thể xử lý ảnh này.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let result = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (!result) throw new Error('Không thể tối ưu ảnh.');
  if (result.size > 6 * 1024 * 1024) {
    result = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.68));
  }
  if (!result || result.size > 6 * 1024 * 1024) {
    throw new Error('Ảnh sau tối ưu vẫn vượt quá 6 MB.');
  }
  return result;
}

function ManagedImageCard({ slot, title, description, defaultImage }) {
  const inputRef = useRef(null);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    brandingService
      .getManagedImage(slot)
      .then((imageUrl) => {
        if (active) setUrl(imageUrl);
      })
      .catch(() => {
        if (active) setError('Chưa thể tải ảnh từ máy chủ.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slot]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Vui lòng chọn ảnh JPG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Ảnh gốc cần nhỏ hơn 15 MB.');
      return;
    }
    setSaving(true);
    try {
      const optimized = await optimizeImage(file);
      setUrl(await brandingService.uploadManagedImage(slot, optimized));
      setMessage('Ảnh đã được cập nhật trên trang chủ.');
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.message || uploadError.message || 'Chưa thể tải ảnh lên.',
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await brandingService.removeManagedImage(slot);
      setUrl(null);
      setMessage('Đã khôi phục ảnh mặc định.');
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Chưa thể khôi phục ảnh.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="settings-brand-card settings-hero-card">
      <div className="settings-brand-card-heading">
        <div className="settings-brand-icon">
          <ImagePlus size={19} />
        </div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {error && <Alert className="settings-alert" type="error" showIcon message={error} />}
      {message && <Alert className="settings-alert" type="success" showIcon message={message} />}
      <div className="settings-hero-preview">
        {loading ? <Spin /> : <img src={url || defaultImage} alt={`Xem trước: ${title}`} />}
        <div className="settings-hero-preview-overlay" />
        <span className="settings-hero-preview-label">
          {url ? 'ẢNH ĐANG SỬ DỤNG' : 'ẢNH MẶC ĐỊNH'}
        </span>
        <div className="settings-hero-preview-copy">
          <strong>{title}</strong>
        </div>
      </div>
      <div className="settings-upload-actions">
        <input
          ref={inputRef}
          className="settings-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={upload}
        />
        <Button
          className="settings-upload-button"
          loading={saving}
          icon={<UploadCloud size={16} />}
          onClick={() => inputRef.current?.click()}
        >
          Tải ảnh lên
        </Button>
        {url && (
          <Button
            className="settings-reset-button"
            disabled={saving}
            icon={<RotateCcw size={15} />}
            onClick={reset}
          >
            Khôi phục ảnh mặc định
          </Button>
        )}
      </div>
      <div className="settings-upload-help">
        <ShieldCheck size={15} /> JPG, PNG hoặc WEBP · Ảnh gốc tối đa 15 MB · Tự tối ưu trước khi
        tải lên.
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const inputRef = useRef(null);
  const heroInputRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [heroUrl, setHeroUrl] = useState(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [heroSuccess, setHeroSuccess] = useState('');
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    brandingService
      .getLogo()
      .then((url) => {
        if (active) setLogoUrl(url);
      })
      .catch(() => {
        if (active) setError('Chưa thể tải cài đặt thương hiệu từ máy chủ.');
      })
      .finally(() => {
        if (active) setLoadingLogo(false);
      });
    brandingService
      .getHero()
      .then((url) => {
        if (active) setHeroUrl(url);
      })
      .catch(() => {
        if (active) setHeroError('Chưa thể tải ảnh nền từ máy chủ.');
      })
      .finally(() => {
        if (active) setLoadingHero(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const chooseHeroFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setHeroError('');
    setHeroSuccess('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setHeroError('Vui lòng chọn ảnh JPG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setHeroError('Ảnh gốc cần nhỏ hơn 15 MB.');
      return;
    }

    setSavingHero(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2400 / bitmap.width, 1400 / bitmap.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Trình duyệt không thể xử lý ảnh này.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();

      let optimized = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
      if (!optimized) throw new Error('Không thể tối ưu ảnh.');
      if (optimized.size > 6 * 1024 * 1024) {
        optimized = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.68));
      }
      if (!optimized || optimized.size > 6 * 1024 * 1024) {
        throw new Error('Ảnh sau tối ưu vẫn vượt quá 6 MB.');
      }

      const url = await brandingService.uploadHero(optimized);
      setHeroUrl(url);
      setHeroSuccess('Ảnh nền Hero đã được cập nhật trên trang chủ.');
    } catch (uploadError) {
      setHeroError(
        uploadError.response?.data?.message || uploadError.message || 'Chưa thể tải ảnh lên.',
      );
    } finally {
      setSavingHero(false);
    }
  };

  const resetHero = async () => {
    setSavingHero(true);
    setHeroError('');
    setHeroSuccess('');
    try {
      await brandingService.removeHero();
      setHeroUrl(null);
      setHeroSuccess('Đã khôi phục ảnh nền mặc định.');
    } catch (removeError) {
      setHeroError(removeError.response?.data?.message || 'Chưa thể khôi phục ảnh nền.');
    } finally {
      setSavingHero(false);
    }
  };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setSuccess('');

    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
      setError('Vui lòng chọn tệp ảnh SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Tệp SVG cần nhỏ hơn 2 MB.');
      return;
    }

    setSaving(true);
    try {
      const url = await brandingService.uploadLogo(file);
      setLogoUrl(url);
      window.dispatchEvent(new CustomEvent('aurelis:brand-logo-updated', { detail: { url } }));
      setSuccess('Logo SVG đã được cập nhật trên toàn bộ website.');
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.message || uploadError.message || 'Chưa thể tải logo lên.',
      );
    } finally {
      setSaving(false);
    }
  };

  const resetLogo = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await brandingService.removeLogo();
      setLogoUrl(null);
      window.dispatchEvent(
        new CustomEvent('aurelis:brand-logo-updated', { detail: { url: null } }),
      );
      setSuccess('Đã khôi phục logo Aurelis mặc định.');
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Chưa thể khôi phục logo mặc định.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <span className="settings-eyebrow">NHẬN DIỆN THƯƠNG HIỆU</span>
        <h1 className="brand-display">Cài đặt thương hiệu</h1>
        <p>Quản lý hình ảnh thương hiệu hiển thị trên website Aurelis Coffee.</p>
      </div>

      <section className="settings-brand-card">
        <div className="settings-brand-card-heading">
          <div className="settings-brand-icon">
            <ImagePlus size={19} />
          </div>
          <div>
            <h2>Logo website</h2>
            <p>Logo xuất hiện ở header, footer và khu vực quản trị.</p>
          </div>
        </div>

        {error && <Alert className="settings-alert" type="error" showIcon message={error} />}
        {success && <Alert className="settings-alert" type="success" showIcon message={success} />}

        <div className="settings-logo-preview">
          <div className="settings-logo-preview-head">
            <span>XEM TRƯỚC · NỀN SÁNG</span>
            <span>HEADER</span>
          </div>
          <div className="settings-logo-preview-light">
            {loadingLogo ? <Spin /> : <BrandLogo />}
          </div>
          <div className="settings-logo-preview-head settings-preview-dark-label">
            <span>XEM TRƯỚC · NỀN TỐI</span>
            <span>FOOTER</span>
          </div>
          <div className="settings-logo-preview-dark">
            {logoUrl ? (
              <img src={logoUrl} alt="Xem trước logo Aurelis Coffee" />
            ) : (
              <BrandLogo light />
            )}
          </div>
        </div>

        <div className="settings-upload-actions">
          <input
            ref={inputRef}
            className="settings-file-input"
            type="file"
            accept=".svg,image/svg+xml"
            onChange={chooseFile}
          />
          <Button
            className="settings-upload-button"
            loading={saving}
            icon={<UploadCloud size={16} />}
            onClick={() => inputRef.current?.click()}
          >
            Tải logo SVG lên
          </Button>
          {logoUrl && (
            <Button
              className="settings-reset-button"
              disabled={saving}
              icon={<RotateCcw size={15} />}
              onClick={resetLogo}
            >
              Khôi phục mặc định
            </Button>
          )}
        </div>
        <div className="settings-upload-help">
          <ShieldCheck size={15} /> Chỉ nhận SVG · Tối đa 2 MB · Logo vector hiển thị sắc nét trên
          mọi kích thước.
        </div>
      </section>

      <section className="settings-brand-card settings-hero-card">
        <div className="settings-brand-card-heading">
          <div className="settings-brand-icon">
            <ImagePlus size={19} />
          </div>
          <div>
            <h2>Ảnh nền Hero</h2>
            <p>Ảnh lớn ở đầu trang chủ, phía sau phần giới thiệu Aurelis.</p>
          </div>
        </div>

        {heroError && (
          <Alert className="settings-alert" type="error" showIcon message={heroError} />
        )}
        {heroSuccess && (
          <Alert className="settings-alert" type="success" showIcon message={heroSuccess} />
        )}

        <div className="settings-hero-preview" aria-label="Xem trước ảnh nền Hero">
          {loadingHero ? (
            <Spin />
          ) : (
            <img
              src={
                heroUrl ||
                'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=85'
              }
              alt="Xem trước ảnh nền trang chủ"
            />
          )}
          <div className="settings-hero-preview-overlay" />
          <span className="settings-hero-preview-label">
            {heroUrl ? 'ẢNH NỀN ĐANG SỬ DỤNG' : 'ẢNH NỀN MẶC ĐỊNH'}
          </span>
          <div className="settings-hero-preview-copy">
            <small>CÀ PHÊ ĐƯỢC CHỌN BẰNG SỰ TINH TẾ</small>
            <strong>Chậm lại một chút.</strong>
          </div>
        </div>

        <div className="settings-upload-actions">
          <input
            ref={heroInputRef}
            className="settings-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={chooseHeroFile}
          />
          <Button
            className="settings-upload-button"
            loading={savingHero}
            icon={<UploadCloud size={16} />}
            onClick={() => heroInputRef.current?.click()}
          >
            Tải ảnh nền lên
          </Button>
          {heroUrl && (
            <Button
              className="settings-reset-button"
              disabled={savingHero}
              icon={<RotateCcw size={15} />}
              onClick={resetHero}
            >
              Khôi phục ảnh mặc định
            </Button>
          )}
        </div>
        <div className="settings-upload-help">
          <ShieldCheck size={15} /> JPG, PNG hoặc WEBP · Ảnh gốc tối đa 15 MB · Tự tối ưu còn tối đa
          2400 × 1400 px.
        </div>
      </section>
      <ManagedImageCard
        slot="story"
        title="Ảnh câu chuyện Aurelis"
        description="Ảnh minh họa bên cạnh phần giới thiệu câu chuyện thương hiệu."
        defaultImage="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=90"
      />
      <ManagedImageCard
        slot="closing"
        title="Ảnh nền cuối trang"
        description="Ảnh nền phía sau lời mời khám phá thực đơn ở cuối trang chủ."
        defaultImage="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85"
      />
      <ManagedImageCard
        slot="menuHero"
        title="Banner thực đơn"
        description="Ảnh lớn ở đầu trang thực đơn."
        defaultImage="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2200&q=90"
      />
      <ManagedImageCard
        slot="storyHero"
        title="Banner câu chuyện"
        description="Ảnh nền đầu trang Câu chuyện Aurelis."
        defaultImage="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=2200&q=90"
      />
      <ManagedImageCard
        slot="storyCraft"
        title="Ảnh nội dung câu chuyện"
        description="Ảnh minh họa phần Từ hạt đến tách."
        defaultImage="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85"
      />
      <ManagedImageCard
        slot="storesHero"
        title="Banner cửa hàng"
        description="Ảnh nền đầu trang Cửa hàng."
        defaultImage="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=2200&q=90"
      />
      <ManagedImageCard
        slot="reservationHero"
        title="Ảnh đặt bàn"
        description="Ảnh trong phần giới thiệu trang Đặt bàn."
        defaultImage="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1500&q=90"
      />
    </div>
  );
}
