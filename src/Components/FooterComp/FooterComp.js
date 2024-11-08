// Footer.js
import React from 'react';
import './FooterComp.css'; // Optional for external styling

const FooterComp = () => {
    return (
        <footer className="footer">
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} KGF. All rights reserved.
            </div>
        </footer>
    );
};

export default FooterComp;
