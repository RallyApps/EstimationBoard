Rally Estimation Board
============

![Title](https://raw.github.com/RallyApps/EstimationBoard/master/screenshots/title-screenshot.png)

## Overview

The Estimation Board app provides teams with an easy view of seeing estimates of user stories, defects, and defect suites. You can update an estimate by simply clicking a card and dragging across columns. The state of the item is changed when you drag across columns.

## How to Use

### Running the App

<b>NOTE:</b> To use this app in debug mode (i.e. run App-debug.html from a browser), you need to hardcode a specific project and workspace OID. Otherwise, the hangman variables won't resolve correctly. This doesn't apply in the deployed version.

If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard. Then copy App.html from the deploy folder into the HTML text area. That's it, it should be ready to use.

Or you can just click [here](https://raw.github.com/RallyApps/EstimationBoard/master/deploy/App.html) to find the file and copy it into the custom HTML app.

### Using the App

You can specify the types of columns you want. You can specify a name and the estimate size.

Default estimations are determined by these categories and their corresponding values:
    
    0: Not Estimated
    1: Very Small
    2: Small
    3: Medium
    5: Big
    8: Very Big
    13: Huge

You can change this to any custom value you please. You can configure this from the App Tools drop down menu. Select App Tools -> Settings to add, remove, or change columns.

![Setup](https://raw.github.com/RallyApps/EstimationBoard/master/screenshots/setup-screenshot.png)

To switch states of cards, just click on the card header and drag it to the column of your choosing. The column will highlight to show you where the card will go. Don't worry if you made a mistake and need to revert a card back to its original place, all state changes will be made no matter which direction you go in.

You can still go into the user story/defect detail page by clicking on the user story/defect ID on the top left of the card.

## Customize this App

You're free to customize this app to your liking (see the License section for details). If you need to add any new Javascript or CSS files, make sure to update config.json so it will be included the next time you build the app.

This app uses the Rally SDK 1.32. The documentation can be found [here](http://developer.rallydev.com/help/app-sdk). 

Available Rakefile tasks are:

    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline
    rake clean                      # Clean all generated output
    rake debug                      # Build a debug version of the app, useful for local development
    rake deploy                     # Deploy an app to a Rally server
    rake deploy:debug               # Deploy a debug app to a Rally server
    rake deploy:info                # Display deploy information
    rake jslint                     # Run jslint on all JavaScript files used by this app, can be enabled by setting ENABLE_JSLINT=true.

## License

Kanban is released under the MIT license.  See the file [LICENSE](https://raw.github.com/RallyApps/EstimationBoard/master/LICENSE) for the full text.