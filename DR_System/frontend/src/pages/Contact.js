// Contact.js
import React, { useState } from 'react';
import './Contact.css';
import contactBg from '../assets/contact-bg.jpg';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-container" style={{ backgroundImage: `url(${contactBg})` }}>
            <div className="contact-content">
                <h1>Contact Us</h1>
                <p>
                    Have questions or need support? Reach out to us, and we’ll be happy to help.
                </p>

                <div className="contact-grid">
                    {/* Contact Form */}
                    <div className="contact-form">
                        <h2>Send Us a Message</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Your Name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                            />
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Your Email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                            <textarea 
                                name="message" 
                                placeholder="Your Message" 
                                value={formData.message} 
                                onChange={handleChange} 
                                required 
                            />
                            <button type="submit">Send Message</button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p><strong>Address:</strong> Amrutvahini College of Engineering, Sangamner</p>
                        <p><strong>Email:</strong> principal@avcoe.org</p>
                        <p><strong>Phone:</strong> 9730955773</p>

                        <div className="map-container">
                            <h3>Our Location</h3>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3758.3105208456527!2d74.18287627499177!3d19.61401798170453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdd0070e7eb3683%3A0x812069ad0d4f7f8f!2sAmrutvahini%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1740730564244!5m2!1sen!2sin" 
                                width="100%" 
                                height="250" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy"
                                title="Our Location"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
