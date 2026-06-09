import { FaTwitter, FaInstagram, FaDiscord, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>FIFA WORLD CUP 2026</h3>
          <p>The ultimate fantasy football experience for World Cup 2026.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#players">Players</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#cookies">Cookie Policy</a></li>
          </ul>
        </div>
        
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#twitter"><FaTwitter /></a>
            <a href="#instagram"><FaInstagram /></a>
            <a href="#discord"><FaDiscord /></a>
            <a href="#youtube"><FaYoutube /></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 FIFA World Cup Draft. All rights reserved.</p>
      </div>
    </footer>
  );
}
