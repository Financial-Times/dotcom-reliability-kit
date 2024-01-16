
# @dotcom-reliability-kit/splunk-dashboard

Splunk dashboard templates for apps which use [FT.com Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit#readme).

  * [Usage](#usage)
  * [Contributing](#contributing)
  * [License](#license)


## Usage

This package includes JSON files which can be used to create Splunk dashboards. The following dashboard templates are available:

  * **[Heroku](./src/heroku.json):** A dashboard to view issues with apps which use Reliability Kit and Heroku Log Drains. This template includes an input to set system code, so there's no need to create your own copy of this dashboard – just use the [live dashboard](https://financialtimes.splunkcloud.com/en-US/app/search/reliability_kit_heroku) and change the system code.

  * **[Crashes](./src/crashes.json):** A dashboard to view crashing errors across all applications based on an optional filter. You can use the [live dashboard](https://financialtimes.splunkcloud.com/en-US/app/search/reliability_kit_crashes) and change the filter to suit your team or group's needs.

If you're set on creating your own dashboard using these templates, then you can [create a dashboard in Splunk here](https://financialtimes.splunkcloud.com/en-US/app/search/dashboards), making sure to select "Dashboard Studio" when asked how you want to build your dashboard.

Once you have a dashboard on the edit view (the one that opens by default), you can click the "Source" button in the toolbar (the last one which has angle brackets inside a window icon). Paste the relevant template JSON into the new JSON editing view that opens.


## Contributing

See the [central contributing guide for Reliability Kit](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/docs/contributing.md) for the basics. There are also some additional requirements for working with Splunk dashboards.

If you make edits using the Splunk UI (see [usage section](#usage) for details), make sure that only the changes you require are actually pasted back into this repo. This includes making sure that you don't accidentally break data source linking etc. It's a good idea to rename the IDs that the Splunk UI generates so that it's easier to see what the dashboard is doing.


## License

Licensed under the [MIT](https://github.com/Financial-Times/dotcom-reliability-kit/blob/main/LICENSE) license.<br/>
Copyright &copy; 2022, The Financial Times Ltd.
