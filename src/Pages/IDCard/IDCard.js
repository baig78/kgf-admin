import React from "react";
import PropTypes from 'prop-types';
import "./IDCard.css";

const CardFront = ({ cardDetails }) => {
    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "center",
                marginLeft: "200px",
                marginTop: "20px"
            }}>
                <div className="card-front">
                    <div className="header">
                        <img src="../assets/download.png" alt="KGF Logo" className="logo" />
                        <div className="title">
                            <h1>KGF</h1>
                            <h2>KAMMA GLOBAL FEDERATION</h2>
                        </div>
                        <div className="photo">
                            <img style={{ width: "58px", height: "58px" }} src={cardDetails.photo} alt="User im" className="user-photo" />
                        </div>
                    </div>
                    <div className="section-details">
                        <div className="details">
                            <div className="row">
                                <span>Name:</span>
                                <span>{cardDetails.name}</span>
                            </div>
                            <div className="row">
                                <span>Membership No:</span>
                                {/* <span>{cardDetails.memberShip}</span> */}
                                <span>KGF-M50001</span>
                            </div>
                            <div className="row">
                                <span>State:</span>
                                <span>{cardDetails.state}</span>
                            </div>
                        </div>
                        <div>
                            <img src="../assets/qrcode.png" alt="QR Code" className="qr-code" />
                        </div>
                    </div>
                    <div className="signature-section">
                        <div className="signature">
                            <img src="../assets/sign.png" alt="Signature" />
                            <p><strong>Jetti Kusuma Kumar</strong></p>
                            <p>Founder President</p>
                        </div>
                    </div>
                    <div className="footer-idcard">
                        <span>ONE IDENTITY, ONE LEGACY</span>
                    </div>
                </div>
                <div className="card-back">
                    <img style={{
                        width: "220px",
                        zIndex: "-1",
                        display: "block",
                        position: "absolute",
                        left: "280px"
                    }} src="../assets/download.png" alt="KGF Logo" className="logo" />
                    <div className="note-section">
                        <span>Note:</span>
                        <ol>
                            <li>For personal use only; no transfers.</li>
                            <li>For ID only; Show this card at KGF events.</li>
                            <li>Does not authorize speaking for KGF.</li>
                        </ol>
                    </div>
                    <div className="contact-section">
                        <h4>KAMMA GLOBAL FEDERATION</h4>
                        <p>Rd. No.41, Jubilee Hills, </p>
                        <p> Hyderabad, Telangana - 500033</p>
                        <p>Mobile: +91 90555 17555 | Email: info@kammaglobal.com</p>
                        <p>Web: www.kammaglobal.com</p>
                    </div>
                </div>
            </div >
        </>
    );
};

CardFront.propTypes = {
    cardDetails: PropTypes.shape({
        photo: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired
    }).isRequired
};

export default CardFront;
