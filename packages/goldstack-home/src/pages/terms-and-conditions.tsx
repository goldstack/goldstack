import React from 'react';
import Head from 'next/head';
import Header from 'src/components/Header';

import AbstractShapes from '../styles/front-3.2.1/assets/svg/components/abstract-shapes-12.svg';

const Hero = (): JSX.Element => {
  return (
    <div
      className="bg-img-hero"
      style={{ backgroundImage: 'url(' + AbstractShapes + ')' }}
    >
      <div className="container space-top-3 space-top-lg-4 space-bottom-2 position-relative z-index-2">
        <div className="w-md-80 w-lg-60 text-center mx-md-auto">
          <h1>Goldstack Terms &amp; Conditions</h1>
          <p>Effective date: 12th September 2020</p>
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Goldstack - Terms and Conditions</title>
      </Head>
      <Header></Header>
      <Hero></Hero>
      <div className="container space-2 space-bottom-lg-3">
        <div className="row">
          <div
            id="stickyBlockStartPoint"
            className="col-md-4 col-lg-3 mb-7 mb-md-0"
          >
            <nav
              className="js-sticky-block card shadow-none bg-light hs-kill-sticky"
              data-hs-sticky-block-options='{
                 "parentSelector": "#stickyBlockStartPoint",
                 "targetSelector": "#logoAndNav",
                 "breakpoint": "md",
                 "startPoint": "#stickyBlockStartPoint",
                 "endPoint": "#stickyBlockEndPoint",
                 "stickyOffsetTop": 24,
                 "stickyOffsetBottom": 24
               }'
            >
              <div className="card-body">
                <ul className="js-scroll-nav nav nav-sm nav-x-0 flex-column">
                  <li className="nav-item active">
                    <a
                      className="nav-link font-weight-bold mb-2"
                      href="#services"
                    >
                      1. Using our services
                    </a>

                    <ol className="navbar-nav">
                      <li className="nav-item">
                        <a className="nav-link mb-2" href="#personal-data">
                          A. Personal Data that we collect about you
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link mb-2" href="#information">
                          B. Information that we collect automatically on our
                          Sites
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link mb-2" href="#liability">
                          C. Limited Liability
                        </a>
                      </li>
                    </ol>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link font-weight-bold mb-2"
                      href="#privacy"
                    >
                      2. Privacy and copyright protection
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link font-weight-bold mb-2"
                      href="#yourContent"
                    >
                      3. Your content in our services
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          <div className="col-md-8 col-lg-9">
            <div id="intro" className="space-bottom-1">
              <div className="mb-3">
                <h2 className="h3">Welcome to Goldstack</h2>
              </div>

              <p>
                Thanks for using our products and services
                (&quot;Services&quot;). The Services are provided by Pureleap
                Pty. Ltd. (&quot;Pureleap&quot;), located at 44/202 The Avenue,
                3052 Parkville, Australia.
              </p>
              <p>
                By using our Services, you are agreeing to these terms. Please
                read them carefully.
              </p>
              <p>
                Our Services are very diverse, so sometimes additional terms or
                product requirements (including age requirements) may apply.
                Additional terms will be available with the relevant Services,
                and those additional terms become part of your agreement with us
                if you use those Services.
              </p>
            </div>

            <div id="services" className="space-bottom-1 active">
              <div className="mb-3">
                <h3>1. Using our services</h3>
              </div>

              <p>
                You must follow any policies made available to you within the
                Services.
              </p>
              <p>
                Do not misuse our Services. For example, do not interfere with
                our Services or try to access them using a method other than the
                interface and the instructions that we provide. You may use our
                Services only as permitted by law, including applicable export
                and re-export control laws and regulations. We may suspend or
                stop providing our Services to you if you do not comply with our
                terms or policies or if we are investigating suspected
                misconduct.
              </p>
              <p>
                Do not engage in selling, sublicensing and/or otherwise
                commercializing any intellectual property of Pureleap other than
                for the express purpose of using our templates as starting point
                for your development projects. Templates may not be used to
                develop services substantially similar to the Goldstack service
                as offered on <a href="/">goldstack.party</a>.
              </p>
              <p>
                Using our Services does not give you ownership of any
                intellectual property rights in our Services or the content you
                access. You may not use content from our Services unless you
                obtain permission from its owner or are otherwise permitted by
                law. These terms do not grant you the right to use any branding
                or logos used in our Services. Do not remove, obscure, or alter
                any legal notices displayed in or along with our Services.
              </p>

              <div id="personal-data" className="mb-3 active">
                <h4>A. Personal Data that we collect about you.</h4>
              </div>

              <p>
                Personal Data is any information that relates to an identified
                or identifiable individual. The Personal Data that you provide
                directly to us through our Sites will be apparent from the
                context in which you provide the data. In particular:
              </p>

              <ul>
                <li className="pb-2">
                  When you register for an account we collect your full name,
                  email address, and account log-in credentials.
                </li>
                <li className="pb-2">
                  When you fill-in our online form to contact our sales team, we
                  collect your full name, work email, country, and anything else
                  you tell us about your project, needs and timeline.
                </li>
                <li className="pb-2">
                  When you use the Checkout, we collect your email address. We
                  use Stripe to store your payment information securely.
                  Pureleap will have no knowledge of your credit card number.
                </li>
              </ul>

              <p>
                When you respond to Pureleap emails or surveys we collect your
                email address, name and any other information you choose to
                include in the body of your email or responses. If you contact
                us by phone, we will collect the phone number you use to call
                Pureleap. If you contact us by phone as a user, we may collect
                additional information in order to verify your identity.
              </p>

              <div id="information" className="mb-3 active">
                <h4>
                  B. Information that we collect automatically on our Sites.
                </h4>
              </div>

              <p>
                We also may collect information about your online activities on
                websites and connected devices over time and across third-party
                websites, devices, apps and other online features and services.
                We use Google Analytics on our Sites to help us analyze Your use
                of our Sites and diagnose technical issues.
              </p>

              <p>
                To learn more about the cookies that may be served through our
                Sites and how You can control our use of cookies and third-party
                analytics, please see our Cookie Policy.
              </p>

              <div id="liability" className="mb-3 active">
                <h4>C. Limited Liability</h4>
              </div>

              <p>
                Our Services are provided “as is,” with all faults, and Pureleap
                express no representations or warranties, of any kind related to
                this Website or the materials contained on this Website. Also,
                nothing contained on this Website shall be interpreted as
                advising you.
              </p>

              <p>
                In no event shall Pureleap, nor any of its officers, directors
                and employees, shall be held liable for anything arising out of
                or in any way connected with your use of out Services whether
                such liability is under contract. Company Name, including its
                officers, directors and employees shall not be held liable for
                any indirect, consequential or special liability arising out of
                or in any way related to your use of this Website.
              </p>
            </div>

            <div id="privacy" className="space-bottom-1 active">
              <div className="mb-3">
                <h3>2. Privacy and copyright protection</h3>
              </div>

              <p>
                Pureleap privacy policies explain how we treat your personal
                data and protect your privacy when you use our Services. By
                using our Services, you agree that Pureleap can use such data in
                accordance with our privacy policies.
              </p>
              <p>
                We respond to notices of alleged copyright infringement and
                terminate accounts of repeat infringers according to the process
                set out in the U.S. Digital Millennium Copyright Act.
              </p>
              <p>
                We provide information to help copyright holders manage their
                intellectual property online. If you think somebody is violating
                your copyrights and want to notify us, you can find information
                about submitting notices and Pureleap policy about responding to
                notices in our Help Center .
              </p>
            </div>

            <div id="yourContent">
              <div className="mb-3">
                <h3>3. Your content in our services</h3>
              </div>

              <p>
                Some of our Services allow you to upload, submit, store, send or
                receive content. You retain ownership of any intellectual
                property rights that you hold in that content. In short, what
                belongs to you stays yours.
              </p>
              <p>
                When you upload, submit, store, send or receive content to or
                through our Services, you give Pureleap (and those we work with)
                a worldwide license to use, host, store, reproduce, modify,
                create derivative works (such as those resulting from
                translations, adaptations or other changes we make so that your
                content works better with our Services), communicate, publish,
                publicly perform, publicly display and distribute such content.
                The rights you grant in this license are for the limited purpose
                of operating, promoting, and improving our Services, and to
                develop new ones. This license continues even if you stop using
                our Services. Some Services may offer you ways to access and
                remove content that has been provided to that Service. Also, in
                some of our Services, there are terms or settings that narrow
                the scope of our use of the content submitted in those Services.
                Make sure you have the necessary rights to grant us this license
                for any content that you submit to our Services.
              </p>
            </div>

            <div id="stickyBlockEndPoint"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
