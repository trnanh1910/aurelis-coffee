import { Alert, Button, Checkbox, Input } from 'antd';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const destinations = {
  ADMIN: '/admin/dashboard',
  MANAGER: '/admin/dashboard',
  CASHIER: '/pos',
  BARISTA: '/barista',
  CUSTOMER: '/',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email.trim(), password, remember);
      const returnTo = location.state?.from;
      navigate(returnTo?.pathname || destinations[user.role] || '/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Đăng nhập chưa thành công. Vui lòng kiểm tra email và mật khẩu.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-showcase" aria-label="Aurelis Coffee">
        <img
          src="https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1600&q=90"
          alt="Không gian ấm áp tại Aurelis Coffee"
        />
        <div className="auth-showcase-shade" />
        <Link to="/" className="auth-showcase-brand">
          <BrandLogo light />
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">A quieter kind of coffee</span>
          <h2 className="brand-display">
            Một tách cà phê.
            <br />
            Một khoảng lặng
            <br />
            dành riêng cho bạn.
          </h2>
          <p>Hạt cà phê tuyển chọn, rang thủ công và những khoảnh khắc ở lại thật lâu.</p>
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
        <div className="auth-form-wrap">
          <div className="auth-kicker">
            <span /> CHÀO MỪNG BẠN TRỞ LẠI
          </div>
          <h1 className="brand-display">Thật vui khi gặp lại.</h1>
          <p className="auth-intro">Đăng nhập để tiếp tục hành trình cùng Aurelis.</p>
          {error && <Alert className="auth-alert" type="error" showIcon message={error} />}
          <form className="auth-form" onSubmit={submit}>
            <label className="auth-label" htmlFor="login-email">
              Địa chỉ email
            </label>
            <Input
              id="login-email"
              className="auth-input"
              size="large"
              prefix={<Mail size={17} />}
              type="email"
              autoComplete="email"
              placeholder="ten@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="login-password">
                Mật khẩu
              </label>
              <span className="auth-quiet">Tối thiểu 8 ký tự</span>
            </div>
            <Input.Password
              id="login-password"
              className="auth-input"
              size="large"
              prefix={<LockKeyhole size={17} />}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            <div className="auth-options">
              <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)}>
                Ghi nhớ đăng nhập
              </Checkbox>
              <span className="auth-quiet">Bảo mật với Aurelis</span>
            </div>
            <Button htmlType="submit" loading={loading} className="auth-submit" size="large">
              Đăng nhập <ArrowRight size={17} />
            </Button>
          </form>
          <div className="auth-divider">
            <span /> <span>HOẶC</span> <span />
          </div>
          <p className="auth-switch">
            Chưa có tài khoản?{' '}
            <Link to="/register">
              Tạo tài khoản <ArrowRight size={14} />
            </Link>
          </p>
          <div className="auth-secure">
            <ShieldCheck size={16} /> Thông tin của bạn luôn được bảo vệ an toàn.
          </div>
        </div>
        <footer className="auth-panel-footer">
          <Link to="/">← Trở về trang chủ</Link>
          <span>© 2026 Aurelis Coffee</span>
        </footer>
      </section>
    </main>
  );
}
