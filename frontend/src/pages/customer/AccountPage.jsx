import { Alert, Button, Input } from 'antd';
import {
  ArrowRight,
  Coffee,
  Crown,
  LogOut,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const membership = { MEMBER: 'Thành viên', SILVER: 'Bạc', GOLD: 'Vàng', PLATINUM: 'Bạch kim' };

export default function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileState, setProfileState] = useState({ error: '', success: '', loading: false });
  const [passwordState, setPasswordState] = useState({ error: '', success: '', loading: false });
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    setForm({ fullName: user?.fullName || '', phone: user?.phone || '' });
  }, [user]);
  const updateField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const updatePassword = (key) => (event) =>
    setPassword((current) => ({ ...current, [key]: event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileState({ error: '', success: '', loading: true });
    try {
      const nextUser = await authService.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      updateUser(nextUser);
      setProfileState({
        error: '',
        success: 'Thông tin của bạn đã được cập nhật.',
        loading: false,
      });
    } catch (err) {
      setProfileState({
        error: err.response?.data?.message || 'Chưa thể lưu thông tin. Vui lòng thử lại.',
        success: '',
        loading: false,
      });
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setPasswordState({
        error: 'Mật khẩu mới xác nhận chưa trùng khớp.',
        success: '',
        loading: false,
      });
      return;
    }
    setPasswordState({ error: '', success: '', loading: true });
    try {
      await authService.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordState({
        error: '',
        success: 'Mật khẩu đã được thay đổi an toàn.',
        loading: false,
      });
    } catch (err) {
      setPasswordState({
        error: err.response?.data?.message || 'Chưa thể thay đổi mật khẩu.',
        success: '',
        loading: false,
      });
    }
  };

  const signOut = async () => {
    setLogoutLoading(true);
    await logout();
    navigate('/', { replace: true });
  };
  const points = Number(user?.points || 0).toLocaleString('vi-VN');
  const spend = Number(user?.totalSpending || 0).toLocaleString('vi-VN');

  return (
    <div className="account-page">
      <div className="account-hero">
        <div className="account-hero-inner">
          <div className="account-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Tài khoản của tôi</span>
          </div>
          <div className="account-identity">
            <div className="account-avatar">
              {(user?.fullName || 'A').trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="account-overline">KHÔNG GIAN CỦA BẠN</span>
              <h1 className="brand-display">Xin chào, {user?.fullName || 'bạn'}.</h1>
              <p>
                Thành viên Aurelis từ{' '}
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="account-content">
        <section className="loyalty-card">
          <div className="loyalty-card-text">
            <div className="loyalty-brand">
              <Crown size={17} /> AURELIS PRIVILEGE
            </div>
            <h2 className="brand-display">
              Một chút thân quen,
              <br />
              thêm nhiều điều đặc biệt.
            </h2>
            <p>Mỗi lần ghé thăm là thêm một dấu ấn trong hành trình cà phê của bạn.</p>
            <span className="loyalty-member">
              {membership[user?.membershipLevel] || 'Thành viên'} <span>·</span>{' '}
              {user?.customerCode || 'AURELIS MEMBER'}
            </span>
          </div>
          <div className="loyalty-stats">
            <div>
              <span>ĐIỂM TÍCH LŨY</span>
              <strong>{points}</strong>
              <small>điểm Aurelis</small>
            </div>
            <div>
              <span>TỔNG CHI TIÊU</span>
              <strong>
                {spend}
                <i> ₫</i>
              </strong>
              <small>cảm ơn bạn đã đồng hành</small>
            </div>
            <div className="loyalty-card-mark">A</div>
          </div>
        </section>
        <div className="account-grid">
          <section className="account-card">
            <div className="account-card-heading">
              <div className="account-icon">
                <UserRound size={19} />
              </div>
              <div>
                <h2>Thông tin cá nhân</h2>
                <p>Những thông tin giúp chúng tôi chăm sóc bạn tốt hơn.</p>
              </div>
            </div>
            {profileState.error && (
              <Alert className="account-alert" type="error" showIcon message={profileState.error} />
            )}
            {profileState.success && (
              <Alert
                className="account-alert"
                type="success"
                showIcon
                message={profileState.success}
              />
            )}
            <form className="account-form" onSubmit={saveProfile}>
              <label className="account-label" htmlFor="account-name">
                Họ và tên
              </label>
              <Input
                id="account-name"
                size="large"
                prefix={<UserRound size={16} />}
                value={form.fullName}
                onChange={updateField('fullName')}
                required
                minLength={2}
                maxLength={120}
              />
              <label className="account-label" htmlFor="account-email">
                Email đăng nhập
              </label>
              <Input
                id="account-email"
                size="large"
                prefix={<Mail size={16} />}
                value={user?.email || ''}
                disabled
              />
              <label className="account-label" htmlFor="account-phone">
                Số điện thoại
              </label>
              <Input
                id="account-phone"
                size="large"
                prefix={<Phone size={16} />}
                type="tel"
                autoComplete="tel"
                placeholder="Thêm số điện thoại"
                value={form.phone}
                onChange={updateField('phone')}
              />
              <Button className="account-save" htmlType="submit" loading={profileState.loading}>
                Lưu thay đổi <ArrowRight size={16} />
              </Button>
            </form>
          </section>
          <div className="account-side-column">
            <section className="account-card">
              <div className="account-card-heading">
                <div className="account-icon">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h2>Bảo mật tài khoản</h2>
                  <p>Thay đổi mật khẩu định kỳ để an tâm hơn.</p>
                </div>
              </div>
              {passwordState.error && (
                <Alert
                  className="account-alert"
                  type="error"
                  showIcon
                  message={passwordState.error}
                />
              )}
              {passwordState.success && (
                <Alert
                  className="account-alert"
                  type="success"
                  showIcon
                  message={passwordState.success}
                />
              )}
              <form className="account-form" onSubmit={changePassword}>
                <label className="account-label" htmlFor="current-password">
                  Mật khẩu hiện tại
                </label>
                <Input.Password
                  id="current-password"
                  size="large"
                  prefix={<LockKeyhole size={16} />}
                  autoComplete="current-password"
                  value={password.currentPassword}
                  onChange={updatePassword('currentPassword')}
                  required
                  minLength={8}
                />
                <label className="account-label" htmlFor="new-password">
                  Mật khẩu mới
                </label>
                <Input.Password
                  id="new-password"
                  size="large"
                  prefix={<LockKeyhole size={16} />}
                  autoComplete="new-password"
                  value={password.newPassword}
                  onChange={updatePassword('newPassword')}
                  required
                  minLength={8}
                />
                <label className="account-label" htmlFor="confirm-password">
                  Xác nhận mật khẩu mới
                </label>
                <Input.Password
                  id="confirm-password"
                  size="large"
                  prefix={<LockKeyhole size={16} />}
                  autoComplete="new-password"
                  value={password.confirmPassword}
                  onChange={updatePassword('confirmPassword')}
                  required
                  minLength={8}
                />
                <Button
                  className="account-save account-save-secondary"
                  htmlType="submit"
                  loading={passwordState.loading}
                >
                  Cập nhật mật khẩu
                </Button>
              </form>
            </section>
            <section className="account-note">
              <div className="account-icon account-note-icon">
                <Coffee size={18} />
              </div>
              <div>
                <h3>Hẹn gặp bạn tại Aurelis</h3>
                <p>Khám phá những hạt cà phê mới và chọn một góc quen thuộc của riêng mình.</p>
                <Link to="/menu">
                  Khám phá thực đơn <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>
        </div>
        <button className="account-signout" onClick={signOut} disabled={logoutLoading}>
          <LogOut size={16} /> {logoutLoading ? 'Đang đăng xuất…' : 'Đăng xuất khỏi tài khoản'}{' '}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
