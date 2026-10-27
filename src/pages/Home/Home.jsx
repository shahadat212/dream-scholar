import React from 'react';
import { Helmet } from 'react-helmet-async';
import Banner from './Banner';
import SubjectsSection from './SubjectsSection';
import ScholarshipsSection from './ScholarshipsSection';
import ClosingSoon from './ClosingSoon';
import WhyUs from './WhyUs';
import HowToApply from './HowToApply';
import Destinations from './Destinations';
import CertificateSection from './CertificateSection';
import Testimonials from './Testimonials';
import CallToAction from './CallToAction';

const Home = () => {
    return (
        <div>
            <Helmet>
                <title>Home | Dream Scholar Hub</title>
                <meta name="description" content="Search, compare and apply for scholarships from universities worldwide, then track every application in one dashboard." />
            </Helmet>
            <Banner></Banner>
            <SubjectsSection></SubjectsSection>
            <ScholarshipsSection></ScholarshipsSection>
            <ClosingSoon></ClosingSoon>
            <WhyUs></WhyUs>
            <HowToApply></HowToApply>
            <Destinations></Destinations>
            <CertificateSection></CertificateSection>
            <Testimonials></Testimonials>
            <CallToAction></CallToAction>
        </div>
    );
};

export default Home;
