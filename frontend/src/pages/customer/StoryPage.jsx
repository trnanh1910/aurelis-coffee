import { ArrowRight, Bean, Coffee, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { brandingService } from '../../services/brandingService';

export default function StoryPage() {
  const [images, setImages] = useState({});
  useEffect(() => {
    Promise.all(
      ['storyHero', 'storyCraft'].map((slot) =>
        brandingService
          .getManagedImage(slot)
          .then((url) => [slot, url])
          .catch(() => [slot, null]),
      ),
    ).then((entries) => setImages(Object.fromEntries(entries)));
  }, []);
  return (
    <div className="story-page">
      <section className="story-hero">
        <img
          src={
            images.storyHero ||
            'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=2200&q=90'
          }
          alt="Hạt cà phê được rang trong ánh nắng sớm"
        />
        <div />
        <div className="story-hero-copy">
          <span className="lux-eyebrow">DI SẢN AURELIS | EST. 2026</span>
          <h1 className="brand-display">
            Nghệ thuật
            <br />
            <em>của sự kiên nhẫn.</em>
          </h1>
          <p>
            Chúng tôi tin rằng những tuyệt tác đích thực không bao giờ sinh ra từ sự vội vã. Mỗi
            tách cà phê tại Aurelis là một minh chứng cho sự tỉ mỉ, lòng đam mê và nghệ thuật vinh
            danh những giá trị nguyên bản.
          </p>
          <a className="lux-button lux-button-light" href="#our-belief">
            Khám phá hành trình <ArrowRight size={16} />
          </a>
        </div>
        <span className="story-hero-note">FROM VIETNAM, WITH CARE</span>
      </section>
      <section className="story-belief" id="our-belief">
        <span className="lux-eyebrow">LỜI TỰ TÌNH TỪ AURELIS</span>
        <h2 className="brand-display">
          Nơi thời gian ngừng lại
          <br />
          <em>Nhường chỗ cho tinh hoa.</em>
        </h2>
        <p>
          Aurelis không đơn thuần phục vụ cà phê, chúng tôi kiến tạo những khoảnh khắc vô giá. Mọi
          sự hối hả đều dừng lại sau cánh cửa, chỉ còn lại nghệ thuật thủ công tỉ mỉ và những dải
          hương nguyên bản được đánh thức trọn vẹn bằng cả trái tim.
        </p>
        <span className="story-signature">
          AURELIS <i>·</i> WHERE TIME STANDS STILL
        </span>
      </section>
      <section className="story-craft">
        <div className="story-craft-photo">
          <img
            src={
              images.storyCraft ||
              'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85'
            }
            alt="Một tách cà phê được pha thủ công"
            loading="lazy"
          />
          <span>THE ART OF LINGERING </span>
        </div>
        <div className="story-craft-copy">
          <span className="lux-eyebrow">HÀNH TRÌNH TINH HOA</span>
          <h2 className="brand-display">
            Tuyệt tác sinh ra
            <br />
            <em>từ sự tỉ mỉ.</em>
          </h2>
          <div className="story-value">
            <span>
              <Bean strokeWidth={1.6} />
            </span>
            <div>
              <h3>Cội nguồn tinh túy</h3>
              <p>
                Viễn du qua những vùng đất trứ danh, chúng tôi khắt khe chắt lọc từng hạt cà phê
                mang đậm hơi thở của tự nhiên và thổ nhưỡng.
              </p>
            </div>
          </div>
          <div className="story-value">
            <span>
              <Flame strokeWidth={1.6} />
            </span>
            <div>
              <h3>Nghệ thuật rang xay</h3>
              <p>
                Đánh thức linh hồn của hạt bằng kỹ thuật kiểm soát nhiệt độ bậc thầy, tôn vinh trọn
                vẹn nét thanh tao nguyên bản và chiều sâu trong từng nốt hương.
              </p>
            </div>
          </div>
          <div className="story-value">
            <span>
              <Coffee strokeWidth={1.6} />
            </span>
            <div>
              <h3>Chiết xuất từ tâm</h3>
              <p>
                Mọi thao tác pha chế đều là một nghi thức chuyên tâm tuyệt đối, để khoảnh khắc bạn
                nâng tách lên luôn là một trải nghiệm vẹn tròn.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="story-quote">
        <span>OUR PROMISE</span>
        <p className="brand-display">
          “Xa xỉ lớn nhất là sự thảnh thơi,
          <br />
          <em>Trọn vẹn nhất là khoảnh khắc của chính bạn.”</em>
        </p>
        <Link to="/stores">
          Ghé thăm chốn dừng chân <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
