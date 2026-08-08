// About.js
import React from 'react';
import './About.css';
import teamMember1 from '../assets/team-member1.jpeg';
import teamMember2 from '../assets/team-member2.jpeg';
import teamMember3 from '../assets/team-member3.jpeg';
import aboutBg from '../assets/about-bg.jpg';
import substationVisit1 from '../assets/substation_visit1.jpeg'; 
import substationVisit2 from '../assets/substation_visit2.jpeg';
import substationVisit3 from '../assets/substation_visit3.jpeg';

const About = () => {
    return (
        <div className="about-container" style={{ backgroundImage: `url(${aboutBg})` }}>
            <div className="about-content">
                <h3><b>About Our Project</b></h3>
                <p>
                    Welcome to the <strong>AI-Based Demand Response System</strong>, a pioneering initiative 
                    focused on creating a smarter, more efficient energy ecosystem. Our project aims to optimize 
                    energy consumption, reduce costs, and enhance grid stability by leveraging advanced AI techniques.
                </p>

                <section className="vision-section">
                    <h3><b>Our Vision</b></h3>
                    <p>
                        Our vision is to empower energy consumers and grid operators with actionable insights 
                        that promote sustainability, reduce energy wastage, and contribute to a greener planet.
                    </p>
                </section>

                <section className="mission-section">
                    <h3><b>Our Mission</b></h3>
                    <p>
                        We strive to build a user-friendly platform that bridges the gap between energy supply 
                        and demand, ensuring reliability, efficiency, and sustainability. Our mission is to make 
                        a meaningful impact on energy management practices and contribute to a better future.
                    </p>
                </section>

                <section className="team-section">
                    <h2>Meet Our Team</h2>
                    <div className="team-cards">
                        <div className="team-card">
                            <img src={teamMember1} alt="Sarah Patel" />
                            <h3>Avantika Ekhande</h3>
                        </div>
                        <div className="team-card">
                            <img src={teamMember2} alt="Anita Sharma" />
                            <h3>Sakshi Deshmukh</h3>
                        </div>
                        <div className="team-card">
                            <img src={teamMember3} alt="Neha Singh" />
                            <h3>Gauri Dighe</h3>
                        </div>
                    </div>
                </section>

                <section className="visit-section">
                    <h2>Field Visit to 132 KV Substation, Sangamner</h2>
                    <p className="visit-description">
                        As part of our research, we visited the 132 KV substation in Sangamner to understand 
                        the practical aspects of power distribution and grid management. This hands-on experience 
                        helped us gain valuable insights that contributed to our project development.
                    </p>
                    <div className="visit-cards">
                        <div className="visit-card">
                            <img src={substationVisit2} alt="Substation Visit 1" />
                            <p>Exploring grid infrastructure</p>
                        </div>
                        <div className="visit-card">
                            <img src={substationVisit3} alt="Substation Visit 2" />
                            <p>Learning about power distribution</p>
                        </div>
                        <div className="visit-card">
                            <img src={substationVisit1} alt="Substation Visit 3" />
                            <p>Team at the substation</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;