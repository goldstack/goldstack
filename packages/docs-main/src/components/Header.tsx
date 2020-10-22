import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import GitHub from './../icons/github-tile-gray.svg';
import styles from './Header.module.css';

const Toggle = (): JSX.Element => {
  return (
    <>
      <span className="navbar-toggler-default">
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M17.4,6.2H0.6C0.3,6.2,0,5.9,0,5.5V4.1c0-0.4,0.3-0.7,0.6-0.7h16.9c0.3,0,0.6,0.3,0.6,0.7v1.4C18,5.9,17.7,6.2,17.4,6.2z M17.4,14.1H0.6c-0.3,0-0.6-0.3-0.6-0.7V12c0-0.4,0.3-0.7,0.6-0.7h16.9c0.3,0,0.6,0.3,0.6,0.7v1.4C18,13.7,17.7,14.1,17.4,14.1z"
          ></path>
        </svg>
      </span>
      <span className="navbar-toggler-toggled">
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M11.5,9.5l5-5c0.2-0.2,0.2-0.6-0.1-0.9l-1-1c-0.3-0.3-0.7-0.3-0.9-0.1l-5,5l-5-5C4.3,2.3,3.9,2.4,3.6,2.6l-1,1 C2.4,3.9,2.3,4.3,2.5,4.5l5,5l-5,5c-0.2,0.2-0.2,0.6,0.1,0.9l1,1c0.3,0.3,0.7,0.3,0.9,0.1l5-5l5,5c0.2,0.2,0.6,0.2,0.9-0.1l1-1 c0.3-0.3,0.3-0.7,0.1-0.9L11.5,9.5z"
          ></path>
        </svg>
      </span>
    </>
  );
};

const Header = (): JSX.Element => {
  return (
    <header id="header" className="header">
      <div className="js-mega-menu header-section hs-menu-initialized hs-menu-horizontal">
        <Container fluid>
          <Navbar expand="lg">
            <Navbar.Brand
              className={`navbar-expand-lg ${styles.goldstackbrand}`}
            >
              <a
                className={`navbar-brand ${styles.brandtext}`}
                href={process.env.NEXT_PUBLIC_GOLDSTACK_HOME}
                aria-label="Goldstack Logo"
              >
                GOLDSTACK
              </a>
            </Navbar.Brand>
            <Navbar.Text>
              <small>The very best stack, ready for you in minutes</small> ️❤️
            </Navbar.Text>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="btn btn-icon btn-sm rounded-circle"
            >
              <Toggle></Toggle>
            </Navbar.Toggle>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto" as="ul">
                <Nav.Item as="li">
                  <Nav.Link href={process.env.NEXT_PUBLIC_GOLDSTACK_HOME}>
                    Home
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link
                    href={`${process.env.NEXT_PUBLIC_GOLDSTACK_HOME}/#build`}
                  >
                    Build
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link href="/docs">Docs</Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link
                    href={`${process.env.NEXT_PUBLIC_GOLDSTACK_HOME}/pricing`}
                  >
                    Pricing
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as="li">
                  <Nav.Link href="https://github.com/goldstack">
                    <img src={GitHub} style={{ width: '1rem' }}></img>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>
    </header>
  );
};

export default Header;
