import { Link } from 'react-router';
import logoImg from '../../assets/Comp Match.png';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <div className="footer-logo-badge">
                <img src={logoImg} alt="Computer Match" className="footer-logo-img" />
              </div>
              <div className="footer-logo-text-group">
                <span className="footer-brand-title">Computer Match</span>
                <span className="footer-tagline">Power your dreams, Not your Expenses</span>
              </div>
            </Link>
            <p className="footer-mission-text">
              “We believe the right technology can change a life. Our vision is to make powerful, reliable technology accessible to everyone at the right price.”
            </p>
          </div>

          <div className="footer-section">
            <h4>New Products</h4>
            <Link to="/category/new-laptops" className="footer-link">Laptops</Link>
            <Link to="/category/new-computers" className="footer-link">Computers</Link>
            <Link to="/category/new-accessories" className="footer-link">Accessories</Link>
          </div>

          <div className="footer-section">
            <h4>Refurbished</h4>
            <Link to="/category/refurbished-laptops" className="footer-link">Laptops</Link>
            <Link to="/category/refurbished-computers" className="footer-link">Computers</Link>
            <Link to="/category/refurbished-accessories" className="footer-link">Accessories</Link>
            <Link to="/category/refurbished-mac-pcs" className="footer-link">Mac PCs</Link>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Computer Match. All rights reserved.</span>
          <div className="footer-legal-links">
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/privacy-policy" className="footer-link">Privacy</Link>
            <Link to="/terms-of-service" className="footer-link">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
