// These queries will be used to search your inbox for new accounts.
// Make sure to add quotes to increase the search precision

var searchQueries = [

	// GDPR
	'"gdpr"',
	'"privacy" {"updated" "updating" "geüpdatet"}',

	// Thanks
	'"you for" {"registering" "signing up"}',
	'{"for registering" "for signing up" }',
	
	'{"Bedankt voor" "Dank voor"} {"aanmelding" "registreren" "inschrijving"}',

	// Confirm
	'"Complete your " {"login" "account" "registration" "profile"}',
	'"Confirm your " {"login" "account" "registration" "profile" "email" "subscription" "details"}',
	'{"Verify" "verification" "activate"} {"login" "account" "registration" "email"}',
	'"Confirmation" "registration"',
	'{"Bevestig" "activeer" "activeren" "bevestigen" "bevestiging" "voltooien"} {"email" "account" "registratie" "profiel" "inschrijving"}',

	// New account
	'"Your new account"',
	'"nieuw account"',

	// Welcome
	'"Welcome to"',
	'"Welkom"',

	// Passwords
	'"reset" "password"',
	'"wachtwoord" "reset"',
	'{"inlogcode" "logincode"}',
]
