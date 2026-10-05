import { ArrowRight, Coffee, Leaf, Sparkles } from 'lucide-react';
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
          <span className="lux-eyebrow">THE AURELIS STORY · EST. 2020</span>
          <h1 className="brand-display">
            Good things
            <br />
            <em>take time.</em>
          </h1>
          <p>
            Một tách cà phê ngon là lời nhắc dịu dàng rằng những điều đáng quý luôn cần được chăm
            chút.
          </p>
          <a className="lux-button lux-button-light" href="#our-belief">
            Câu chuyện của chúng tôi <ArrowRight size={16} />
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
          KAurelis không đơn thuần phục vụ cà phê, chúng tôi kiến tạo những khoảnh khắc vô giá. Mọi
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
          <span>THE ART OF SLOW COFFEE</span>
        </div>
        <div className="story-craft-copy">
          <span className="lux-eyebrow">TỪ HẠT ĐẾN TÁCH</span>
          <h2 className="brand-display">
            Tỉ mỉ trong từng
            <br />
            <em>điều giản dị.</em>
          </h2>
          <div className="story-value">
            <span>
              <Coffee />
            </span>
            <div>
              <h3>Hạt có nguồn gốc</h3>
              <p>
                Chúng tôi tìm kiếm những vùng trồng và mùa vụ mang hương vị riêng, để mỗi lựa chọn
                đều có lý do.
              </p>
            </div>
          </div>
          <div className="story-value">
            <span>
              <Sparkles />
            </span>
            <div>
              <h3>Rang vừa đủ</h3>
              <p>
                Hương vị được mở ra bằng sự cân bằng — giữ lại nét tự nhiên của hạt và chiều sâu
                trong từng ngụm.
              </p>
            </div>
          </div>
          <div className="story-value">
            <span>
              <Leaf />
            </span>
            <div>
              <h3>Pha bằng sự chú tâm</h3>
              <p>
                Từng công đoạn nhỏ được làm cẩn thận, để khoảnh khắc bạn thưởng thức luôn trọn vẹn.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="story-quote">
        <span>OUR PROMISE</span>
        <p className="brand-display">
          “Một khoảng lặng mang tên cà phê.
          <br />
          <em>Một khoảnh khắc dành riêng cho bạn.”</em>
        </p>
        <Link to="/stores">
          Ghé thăm không gian Aurelis <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
