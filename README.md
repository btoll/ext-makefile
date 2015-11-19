## ext-makefile does all of the following things:

+ Quickly creates a [stub HTML document][stub] with sourced links to ExtJS JavaScript and CSS files (currently supports versions 4, 5 and 6).

+ Optionally downloads a [Sencha Fiddle][fiddle] and inserts it into the new HTML document.

+ Triggers smiles and high fives.

### Why Would I Use This?
I work for Sencha, and I needed a tool that performed all the steps of downloading a given Sencha Fiddle (that demonstrates a bug in the framework) to a local file so I could quickly get setup to debug it.

Beyond that use case, I really have no idea.

### Installation

+ `npm install https://github.com/btoll/ext-makefile.git -g`

### Setup

+ `ext-makefile --init`

### Example

+ `ext-makefile --fiddle=https://fiddle.sencha.com/#fiddle/u1u`

![ScreenShot](/screenshots/stub.png?raw=true)

[stub]: screenshots/stub.png
[fiddle]: https://fiddle.sencha.com/#home

