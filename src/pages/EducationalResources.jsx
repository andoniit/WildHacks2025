import React from "react";
import "./EducationalResources.css";
import Navbar from "../components/nav";
import Footer from "../components/Footer";
import banner from '../components/assets/8.jpg';


const EducationalResources = () => {
  return (
    <>
    <Navbar/>
    <div className="edu-wrapper">
      <div className="edu-banner">
        <img src={banner} alt="Cycle Education Banner" />
      </div>
      <div className="edu-content">
        <h1 className="edu-title">Educational Resources</h1>

        <section className="edu-section">
          <h2>1. Understanding Hormonal Changes</h2>

          <h3>Menstrual Cycle Phases</h3>
          <ul>
            <li><strong>Follicular Phase (Day 1 to ~Day 13):</strong> FSH stimulates ovarian follicles to grow, estrogen levels rise.</li>
            <li><strong>Ovulation (Around Day 14):</strong> Triggered by LH surge. Egg is released from ovary.</li>
            <li><strong>Luteal Phase (Day 15 to ~Day 28):</strong> Corpus luteum secretes progesterone to prepare uterine lining.</li>
            <li><strong>Menstrual Phase:</strong> Hormones drop, lining sheds, period begins.</li>
          </ul>

          <h3>Hormones & Their Roles</h3>
          <ul>
            <li><strong>Estrogen:</strong> Boosts serotonin, supports bones and heart.</li>
            <li><strong>Progesterone:</strong> Linked to bloating and fatigue, stabilizes lining.</li>
            <li><strong>FSH:</strong> Preps eggs in follicles.</li>
            <li><strong>LH:</strong> Triggers ovulation.</li>
          </ul>
          <p>Reference: ACOG Guidelines, Piktochart infographics, Institute for Menstrual Health.</p>

          <h3>Hormonal Impact on Mood & Energy</h3>
          <ul>
            <li>Estrogen & Serotonin improve mood.</li>
            <li>Progesterone may cause fatigue and bloating.</li>
          </ul>
        </section>

        <section className="edu-section">
          <h2>2. Managing Mood Swings Naturally</h2>

          <h3>Diet & Nutrition</h3>
          <ul>
            <li>Magnesium: Dark chocolate, nuts, greens.</li>
            <li>Omega-3: Salmon, flaxseeds, chia seeds.</li>
          </ul>

          <h3>Mindfulness & Movement</h3>
          <ul>
            <li>Yoga (Child’s Pose) helps cramps.</li>
            <li>Box-breathing reduces anxiety.</li>
          </ul>

          <h3>Tracking Tools</h3>
          <ul>
            <li>Log moods with emojis daily.</li>
            <li>Use Clue or FitrWoman for cycle tracking.</li>
          </ul>
        </section>

        <section className="edu-section">
          <h2>3. When to Seek Medical Help</h2>

          <h3>Red Flags</h3>
          <ul>
            <li>Bleeding over 7 days or very heavy.</li>
            <li>Unrelieved pain with OTC meds.</li>
            <li>Fatigue or dizziness = possible anemia.</li>
          </ul>

          <h3>Preparing for a Doctor Visit</h3>
          <ul>
            <li>Track symptoms for 2–3 cycles.</li>
            <li>Write questions (hormones, BC, etc.).</li>
          </ul>

          <h3>Common Conditions</h3>
          <ul>
            <li><strong>PCOS:</strong> Irregular cycles, acne, hair growth.</li>
            <li><strong>Endometriosis:</strong> Painful periods, fertility issues.</li>
          </ul>
        </section>

        <p className="disclaimer">
          Disclaimer: This is educational info only. Please consult your doctor for medical advice.
        </p>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default EducationalResources;
