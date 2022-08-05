/**
 * @module @dotcom-reliability-kit/middleware-render-error-info/lib/render-layout
 */

const fs = require('fs');

// We need a system code for the system. Most of our apps supply a SYSTEM_CODE
// environment variable. If this is not possible then we fall back to the Origami
// default: https://www.ft.com/__origami/service/build/v3/docs/api#get-v3-bundles-css
const systemCode = '$$$-no-bizops-system-code-$$$';

// Build service URLs don't change per-request so work them out here
const buildServiceBaseUrl = 'https://www.ft.com/__origami/service/build/v3';
const buildServiceParams = new URLSearchParams({
	system_code: systemCode,
	brand: 'internal',
	components: [
		'o-autoinit@^3.1.3',
		'o-spacing@^3.2.1',
		'o-colors@^6.4.2',
		'o-layout@^5.2.3',
		'o-header-services@^5.2.3',
		'o-footer-services@^4.2.3',
		'o-syntax-highlight@^4.2.3',
		'o-message@^5.3.1'
	].join(',')
});
const buildServiceCssBundle = `${buildServiceBaseUrl}/bundles/css?${buildServiceParams}`;
const buildServiceJsBundle = `${buildServiceBaseUrl}/bundles/js?${buildServiceParams}`;

// Load CSS syncronously, this is only run once during startup so won't
// negatively impact the app performance while running
const styles = fs.readFileSync(`${__dirname}/render-error-page.css`, 'utf-8');

/**
 * @typedef {object} LayoutRenderingOptions
 * @property {string} body
 *     The main body of the page.
 * @property {import('express').Request} request
 *     An Express request object.
 * @property {import('express').Response} response
 *     An Express response object.
 */

/**
 * Render an HTML error info page.
 *
 * @access private
 * @param {LayoutRenderingOptions} options
 *     Options which impact the rendering of the page.
 * @returns {string}
 *     Returns the rendered error page.
 */
function renderLayout({ body, request }) {
	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
				<title>Error Info</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<link rel="stylesheet" type="text/css" href="${buildServiceCssBundle}" />
				<style>${styles}</style>
				<script defer="" src="${buildServiceJsBundle}"></script>
			</head>
			<body>
				<div class="o-layout o-layout--docs" data-o-component="o-layout" data-o-layout-construct-nav="true">
					<div class="o-layout__header">
						<header class="o-header-services" data-o-component="o-header-services">
							<div class="o-header-services__top">
								<div class="o-header-services__logo"></div>
								<div class="o-header-services__title">
									<a class="o-header-services__product-name" href="${request.url}">
										Reliability Kit Error Info Page
									</a>
								</div>
							</div>
						</header>
						<div class="o-message o-message--alert o-message--error" data-o-component="o-message" data-o-message-close="false">
							<div class="o-message__container">
								<div class="o-message__content">
									<p class="o-message__content-main">
										<span class="o-message__content-highlight">Welcome to the Reliability Kit error info page.</span><br/>
										This page has appeared because you're using the
										<a href="https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/middleware-render-error-info#readme">@dotcom-reliability-kit/middleware-render-error-info</a>
										package in your app.<br/>
										Hopefully this will make it a lot easier for you to debug the cause of this error.<br/>
										Don't panic: this only appears when you're running the app locally!
									</p>
								</div>
							</div>
						</div>
					</div>
					<div class="o-layout__sidebar o-layout-typography"></div>
					<main class="o-layout__main o-layout-typography" data-o-component="o-syntax-highlight">${body}</main>
					<div class="o-layout__footer">
						<footer class="o-footer-services">
							<div class="o-footer-services__container">
								<div class="o-footer-services__wrapper o-footer-services__wrapper--top">
									<a class="o-footer-services__icon-link o-footer-services__icon-link--github" href="https://github.com/Financial-Times/dotcom-reliability-kit#readme">Reliability Kit Documentation</a>
									<a class="o-footer-services__icon-link o-footer-services__icon-link--slack" href="https://financialtimes.slack.com/archives/C02B89GEQHF">#dotcom-support</a>
								</div>
							</div>
							<div class="o-footer-services__container">
								<div class="o-footer-services__wrapper o-footer-services__wrapper--legal">
									<div class="o-footer-services__links">
									<a href="http://help.ft.com/help/legal-privacy/cookies/">Cookies</a>
									<a href="http://help.ft.com/help/legal-privacy/copyright/copyright-policy/">Copyright</a>
									<a href="http://help.ft.com/help/legal-privacy/privacy/">Privacy</a>
									<a href="http://help.ft.com/help/legal-privacy/terms-conditions">Terms &amp; Conditions</a>
									</div>
									<p>
										<span>&#xA9; THE FINANCIAL TIMES LTD ${new Date().getFullYear()}.</span> FT and
										&apos;Financial Times&apos; are trademarks of The Financial Times Ltd.
									</p>
								</div>
							</div>
						</footer>
					</div>
				</div>
			</body>
		</html>
	`;
}

module.exports = renderLayout;
