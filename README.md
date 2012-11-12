AppTemplate for Rally SDK 1 and 2
=========================

## Overview

This Rakefile can be used to create a skeleton Rally app for use with Rally's App SDK 1 and 2.  You must have Ruby 1.9 and the rake gem installed.

The normal workflow for creating an App is to start by creating an App with the new task.

Available tasks are:

    rake new[app_name,sdk_version,server]   # Create an app with the provided name (and optional SDK version and rally server [default: https://rally1.rallydev.com])
    rake debug                              # Build a debug version of the app, useful for local development. 
    rake build                              # Build a deployable app which includes all JavaScript and CSS resources inline. Use after you app is working as you intend so that it can be copied into Rally.
    rake clean                              # Clean all generated output
    rake jslint                             # Run jslint on all JavaScript files used by this app
    rake deploy                             # Deploy the app to a Rally server
    rake deploy:debug                       # Deploy the debug app to a Rally server
    rake deploy:info                        # Display deployment information

You can find more information on installing Ruby and using rake tasks to simplify app development [here](https://rally1.rallydev.com/apps/2.0p3/doc/#!/guide/appsdk_20_starter_kit).

## Differences between creating SDK 1 apps vs SDK 2+ apps

The development process for each SDK is different (SDK 1 uses Dojo and SDK 2 uses ExtJS) but there shouldn't be any problems with using the Rakefile to create, build, and debug apps. The typical way of building and creating apps in either version of the SDK should be similar (SDK 1 using *.template.html and SDK 2 using ExtJS libraries).

What's somewhat different with creating SDK 1 apps is how the script files are included in the *.template.html file. Previously, you manually needed to add the Javascript and CSS files includes into the HTML template file. With this Rakefile, this is no longer the case. When the rake task is executed, all of the Javascript and CSS files will be automatically included right after the SDK include line (this is the case for both debug and deploy files).

The rake:deploy option is untested with SDK1 apps but the way it is designed doesn't depend on the SDK used.

## License

AppTemplate is released under the MIT license.  See the file [LICENSE](https://raw.github.com/RallyApps/AppTemplate/master/LICENSE) for the full text.
