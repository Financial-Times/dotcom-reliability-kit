const appInfo = require('@dotcom-reliability-kit/app-info');
const entities = require('entities');
const renderLayout = require('./render-layout');

/**
 * @import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
 * @import { SerializedError } from '@dotcom-reliability-kit/serialize-error'
 */

const X_API_KEY_REQUEST_PROPERTY_NAME = 'x-api-key';
const COOKIE_REQUEST_PROPERTY_NAME = 'cookie';

const CONCEALED_REQUEST_PROPERTY_NAMES = new Set([
	X_API_KEY_REQUEST_PROPERTY_NAME,
	COOKIE_REQUEST_PROPERTY_NAME
]);

const CONCEALED_VALUE_MESSAGE =
	'** This value is likely sensitive and should be examined via other tools **';

/**
 * @typedef {object} ErrorRenderingOptions
 * @property {ExpressRequest} request
 *     An Express request object.
 * @property {ExpressResponse} response
 *     An Express response object.
 * @property {SerializedError} serializedError
 *     The error to render.
 */

/**
 * Render an HTML error info page.
 *
 * @private
 * @param {ErrorRenderingOptions} options
 *     Options which impact the rendering of the page.
 * @returns {string}
 *     Returns the rendered error page.
 */
function renderErrorPage({ request, response, serializedError }) {
	const appName = appInfo.systemCode || 'application';
	return renderLayout({
		body: `
			<h1 id="errors">Error information</h1>
			${renderError(serializedError)}
			${renderRequest(request)}
			${renderResponse(response)}
			${renderAppInfo(appInfo)}
		`,
		request,
		title: escape(`${serializedError.name} in ${appName}`)
	});
}

/**
 * Render a serialized error to HTML.
 *
 * @private
 * @param {SerializedError} error
 *     The error information to render.
 * @returns {string}
 *     Returns the rendered error.
 */
function renderError(error) {
	let warning = '';

	if (!error.stack) {
		warning = renderWarning({
			title: 'A non-Error object was thrown.',
			body: `
				The thing that was thrown does not extend the Node.js built-in Error class.
				This makes it much harder to debug the issue, as we cannot find the line numbers where
				the error occurred. You'll need to search your source code for anywhere that a non-Error
				appears after the "throw" keyword.
				See the <a href="https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/getting-started/throwing-errors.md#using-error-objects" target="_blank">using error objects guide</a> for more information.
			`
		});
	} else if (!error.isOperational) {
		warning = renderWarning({
			title: 'This error is unexpected.',
			body: `
				It is not extending the <a href="https://github.com/Financial-Times/dotcom-reliability-kit/tree/main/packages/errors#operationalerror" target="_blank">OperationalError</a>
				class provided by Reliability Kit which indicates to us that we don't understand how to manage this error.
				If this is not true, then consider catching this error and throwing an operational error.
				See the <a href="https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/getting-started/throwing-errors.md" target="_blank">throwing errors guide</a> for more information.
			`
		});
	}

	return renderSection({
		id: `error-${error.code} ${error.message}`.replace(/[^a-z0-9_-]+/gi, '-'),
		title: error.name,
		body: warning,
		fields: [
			{
				label: 'Message',
				helpText: 'The human-readable message which describes this error',
				value: error.message
			},
			{
				label: 'Code',
				helpText: 'The machine-readable code which identifies this error',
				value: error.code,
				formatter: renderCodeBlock
			},
			{
				label: 'Status Code',
				helpText: 'The HTTP status code this error should be served under',
				value: error.statusCode,
				formatter: renderCodeBlock
			},
			{
				label: 'Is operational',
				helpText:
					'Whether this is a known or expected error (<a href="https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/getting-started/throwing-errors.md#operational-errors" target="_blank">docs</a>)',
				value: error.isOperational,
				formatter: renderBoolean
			},
			{
				label: 'Related systems',
				helpText: 'Any Biz Ops systems which this error is related to',
				value: error.relatesToSystems,
				formatter: renderBizOpsSystems
			},
			...Object.entries(error.data).map(([key, value]) => {
				return {
					label: `Data (${key})`,
					value,
					formatter: renderAsJson
				};
			}),
			{
				label: 'Fingerprint',
				helpText: "A unique hash generated from this error's stack",
				value: error.fingerprint,
				formatter: renderCodeBlock
			},
			{
				label: 'Stack',
				helpText:
					'The full stack trace for the error, indicating where it was thrown',
				value: error.stack,
				formatter: renderCodeBlock
			},
			{
				label: 'Cause',
				helpText:
					'The original thrown error which resulted in this operational error',
				value: error.cause,
				formatter: renderError
			}
		]
	});
}

/**
 * Render an HTTP request to HTML.
 *
 * @private
 * @param {ExpressRequest} request
 *     The request information to render.
 * @returns {string}
 *     Returns the rendered request.
 */
function renderRequest(request) {
	return renderSection({
		id: 'request',
		title: 'HTTP Request',
		fields: [
			{
				label: 'Method',
				value: request.method,
				formatter: renderCodeBlock
			},
			{
				label: 'Path',
				value: request.path,
				formatter: renderCodeBlock
			},
			...Object.entries(request.query).map(([key, value]) => {
				return {
					label: `Query (${key})`,
					value: CONCEALED_REQUEST_PROPERTY_NAMES.has(key.toLowerCase())
						? CONCEALED_VALUE_MESSAGE
						: value,
					formatter: renderCodeBlock
				};
			}),
			...Object.entries(request.headers).map(([key, value]) => {
				return {
					label: `Header (${key})`,
					value: CONCEALED_REQUEST_PROPERTY_NAMES.has(key.toLowerCase())
						? CONCEALED_VALUE_MESSAGE
						: value,
					formatter: renderCodeBlock
				};
			})
		]
	});
}

/**
 * Render an HTTP response to HTML.
 *
 * @private
 * @param {ExpressResponse} response
 *     The responses information to render.
 * @returns {string}
 *     Returns the rendered response.
 */
function renderResponse(response) {
	return renderSection({
		id: 'response',
		title: 'HTTP Response',
		fields: [
			{
				label: 'Status Code',
				value: response.statusCode,
				formatter: renderCodeBlock
			}
		]
	});
}

/**
 * Render application info to HTML.
 *
 * @private
 * @param {typeof appInfo} appInfo
 *     The app information to render.
 * @returns {string}
 *     Returns the rendered app info.
 */
function renderAppInfo(appInfo) {
	return renderSection({
		id: 'app',
		title: 'App Info',
		fields: [
			{
				label: 'System',
				helpText: 'The system this error is being served by',
				value: appInfo.systemCode,
				formatter: renderBizOpsSystem
			},
			{
				label: 'Environment',
				helpText:
					'The environment (production/development) that the app is running in',
				value: appInfo.environment
			},
			{
				label: 'Cloud provider',
				helpText: 'The cloud provider the app is running on.',
				value: appInfo.cloudProvider
			},
			{
				label: 'Region',
				helpText: 'The cloud region that the app is running in',
				value: appInfo.region
			},
			{
				label: 'Release date',
				helpText: 'When the app was last released',
				value: appInfo.releaseDate
			},
			{
				label: 'Release version',
				value: appInfo.releaseVersion
			},
			{
				label: 'Commit hash',
				value: appInfo.commitHash
			}
		]
	});
}

/**
 * @typedef {object} Field
 * @property {string} label
 *     The text label to add to the definition title.
 * @property {any} value
 *     The value to associate with the label.
 * @property {string} [helpText]
 *     The help text to explain what the field is for.
 * @property {(value: any) => string} [formatter]
 *     A formatter function which accepts a value and returns a formatted string.
 */

/**
 * Render a page section.
 *
 * @private
 * @param {object} section
 *     The section information.
 * @param {string} section.id
 *     The section id.
 * @param {string} section.title
 *     The section title.
 * @param {Field[]} section.fields
 *     The fields to render in the section.
 * @param {string} [section.body]
 *     The section body content.
 * @returns {string}
 *     Returns the rendered section.
 */
function renderSection({ id, title, body, fields }) {
	return `
		<section class="o-layout__main__full-span">
			<h2 id="${escape(id)}">${escape(title)}</h2>
			${body ? body : ''}
			<dl class="kv-list">
				${fields.map(renderField).join('\n')}
			</dl>
		</section>
	`;
}

/**
 * Render a warning message.
 *
 * @private
 * @param {object} warning
 *     The warning information.
 * @param {string} warning.title
 *     The warning title.
 * @param {string} warning.body
 *     The warning body content.
 * @returns {string}
 *     Returns the rendered warning.
 */
function renderWarning({ title, body }) {
	return `
		<div class="o-message o-message--notice o-message--warning-light" data-o-component="o-message" data-o-message-close="false">
			<div class="o-message__container o-layout__unstyled-element">
				<div class="o-message__content o-layout__unstyled-element">
					<p class="o-message__content-main o-layout__unstyled-element">
						<span class="o-message__content-highlight o-layout__unstyled-element">${title}</span><br/>${body}
					</p>
				</div>
			</div>
		</div>
	`;
}

/**
 * Render a definition list title and value.
 *
 * @private
 * @param {Field} field
 *     The field information.
 * @returns {string}
 *     Returns the rendered field.
 */
function renderField({ label, helpText, value, formatter = escape }) {
	if (!value && value !== false) {
		return '';
	}
	if (helpText) {
		helpText = `<br/><small>${helpText}</small>`;
	}
	return `
		<dt class="kv-list__key">
			<span class="kv-list__label">${escape(label)}:</span>
			${helpText || ''}
		</dt>
		<dd class="kv-list__value">${formatter(value)}</dd>
	`;
}

/**
 * Render a block of code.
 *
 * @private
 * @param {string} block
 *     The value to wrap in a `<pre>` element.
 * @returns {string}
 *     Returns the rendered code block.
 */
function renderCodeBlock(block) {
	return `<pre><code>${escape(block)}</code></pre>`;
}

/**
 * Convert a boolean into a "Yes" or "No" string.
 *
 * @private
 * @param {boolean} boolean
 *     The boolean to render.
 * @param {string} trueModifier
 *     The BEM modifier to use when the value is true.
 * @param {string} falseModifier
 *     The BEM modifier to use when the value is false.
 * @returns {string}
 *     Returns the rendered boolean.
 */
function renderBoolean(
	boolean,
	trueModifier = 'positive',
	falseModifier = 'negative'
) {
	return boolean
		? `<span class="boolean boolean--${trueModifier}">Yes</span>`
		: `<span class="boolean boolean--${falseModifier}">No</span>`;
}

/**
 * Render a list of systems, linking them to Biz Ops.
 *
 * @private
 * @param {string[]} systems
 *     An array of system codes.
 * @returns {string}
 *     Returns the rendered systems.
 */
function renderBizOpsSystems(systems) {
	return systems.length ? systems.map(renderBizOpsSystem).join(', ') : 'None';
}

/**
 * Render a single Biz Ops system.
 *
 * @private
 * @param {string} systemCode
 *     The system code to link to.
 * @returns {string}
 *     Returns the rendered system.
 */
function renderBizOpsSystem(systemCode) {
	return `
		<a
			href="https://biz-ops.in.ft.com/System/${escape(systemCode)}"
			target="_blank"
		>${escape(systemCode)}</a>
	`;
}

/**
 * Render a value as JSON in a <pre> element.
 *
 * @private
 * @param {any} value
 *     The value to stringify and render.
 * @returns {string}
 *     Returns the rendered JSON.
 */
function renderAsJson(value) {
	return renderCodeBlock(JSON.stringify(value, null, 4));
}

/**
 * Escape a value for use in HTML.
 *
 * @private
 * @param {any} value
 *     The value to escape.
 * @returns {string}
 *     Returns the HTML-escaped value.
 */
function escape(value) {
	return entities.escapeUTF8(`${value}`);
}

module.exports = renderErrorPage;
