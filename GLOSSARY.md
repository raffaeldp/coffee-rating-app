# Glossary

**Machine**: One physical coffee machine. Has its own QR code, its own secret token, its own Drink list and its own Current Coffee. Ratings and Loads belong to a Machine, because the machine affects how a Coffee tastes. Several Machines can share one server.
_Avoid_: Office (an office may hold several Machines; the app does not model offices).

**Coffee**: A bean product (identified by its package) that can be loaded into a Machine. Has a photo of the package, a name and a description. The catalog of Coffees is shared by all Machines. Loading the same product again reuses the same Coffee.

**Current Coffee**: The Coffee loaded in a given Machine right now. Anyone with the Machine's QR code can change it.

**Load**: The event of refilling a Machine with a Coffee, which makes it that Machine's Current Coffee. The history of Loads is the timeline of which Coffee was in the Machine when.

**Drink**: A beverage a Machine can brew (espresso, lungo, cappuccino…). Each Machine has a fixed list.

**Rating**: One person's anonymous judgement of one Drink made with one Coffee on one Machine: 1–5 stars, whether sugar was added (unknown for Ratings made before this was asked), plus optional Tasting Answers, an optional comment and an optional name. Cannot be changed once submitted.

**Tasting Question**: One of a fixed set of optional questions asked in every Rating (intensity, bitterness, acidity, body, flavour notes, would drink again). Each has an explanation the reviewer can reveal.

**Tasting Answer**: A reviewer's answer to one Tasting Question within a Rating.
