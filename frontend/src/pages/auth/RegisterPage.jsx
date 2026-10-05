import { Alert, Button, Input } from 'antd';
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa trùng khớp.');
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      await login(form.email.trim(), form.password, true);
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Chưa thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-showcase" aria-label="Aurelis Coffee">
        <img
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=90"
          alt="Quầy cà phê thủ công Aurelis"
        />
        <div className="auth-showcase-shade" />
        <Link to="/" className="auth-showcase-brand">
          <BrandLogo light />
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">Your Aurelis story begins here</span>
          <h2 className="brand-display">
            Tạo một tài khoản.
            <br />
            Giữ lại những
            <br />
            điều mình yêu.
          </h2>
          <p>Tích điểm từ mỗi lần ghé thăm và nhận những ưu đãi dành riêng cho bạn.</p>
        </div>
        <div className="auth-showcase-foot">
          <span>EST. 2018</span>
          <span>VIETNAM · SLOW COFFEE</span>
        </div>
      </section>
      <section className="auth-panel">
        <Link to="/" className="auth-mobile-brand">
          <BrandLogo />
        </Link>
        <div className="auth-form-wrap auth-form-wrap-wide">
          <div className="auth-kicker">
            <span /> MỘT ĐIỀU NHỎ ĐẸP BẮT ĐẦU
          </div>
          <h1 className="brand-display">Trở thành một phần.</h1>
          <p className="auth-intro">Tạo tài khoản Aurelis của bạn chỉ trong vài bước.</p>
          {error && <Alert className="auth-alert" type="error" showIcon message={error} />}
          <form className="auth-form auth-register-form" onSubmit={submit}>
            <label className="auth-label" htmlFor="register-name">
              Họ và tên
            </label>
            <Input
              id="register-name"
              className="auth-input"
              size="large"
              prefix={<UserRound size={17} />}
              autoComplete="name"
              placeholder="Tên của bạn"
              value={form.fullName}
              onChange={change('fullName')}
              required
              minLength={2}
              maxLength={120}
            />
            <label className="auth-label" htmlFor="register-email">
              Địa chỉ email
            </label>
            <Input
              id="register-email"
              className="auth-input"
              size="large"
              prefix={<Mail size={17} />}
              type="email"
              autoComplete="email"
              placeholder="ten@email.com"
              value={form.email}
              onChange={change('email')}
              required
            />
            <label className="auth-label" htmlFor="register-phone">
              Số điện thoại <span className="auth-quiet">(không bắt buộc)</span>
            </label>
            <Input
              id="register-phone"
              className="auth-input"
              size="large"
              prefix={<Phone size={17} />}
              type="tel"
              autoComplete="tel"
              placeholder="090 123 4567"
              value={form.phone}
              onChange={change('phone')}
            />
            <label className="auth-label" htmlFor="register-password">
              Tạo mật khẩu
            </label>
            <Input.Password
              id="register-password"
              className="auth-input"
              size="large"
              prefix={<LockKeyhole size={17} />}
              autoComplete="new-password"
              placeholder="Ít nhất 8 ký tự"
              value={form.password}
              onChange={change('password')}
              required
              minLength={8}
            />
            <label className="auth-label" htmlFor="register-confirm">
              Xác nhận mật khẩu
            </label>
            <Input.Password
              id="register-confirm"
              className="auth-input"
              size="large"
              prefix={<LockKeyhole size={17} />}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={change('confirmPassword')}
              required
              minLength={8}
            />
            <p className="auth-consent">
              Bằng việc tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của
              Aurelis Coffee.
            </p>
            <Button htmlType="submit" loading={loading} className="auth-submit" size="large">
              Tạo tài khoản <ArrowRight size={17} />
            </Button>
          </form>
          <p className="auth-switch">
            Đã có tài khoản?{' '}
            <Link to="/login">
              Đăng nhập <ArrowRight size={14} />
            </Link>
          </p>
        </div>
        <footer className="auth-panel-footer">
          <Link to="/">← Trở về trang chủ</Link>
          <span>© 2026 Aurelis Coffee</span>
        </footer>
      </section>
    </main>
  );
}
