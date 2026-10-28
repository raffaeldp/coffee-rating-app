# Coffees are shared across Machines; Loads and Ratings belong to one Machine

The Coffee catalog (photo, name, description) is global, so a product bought for several machines exists once and is never duplicated. Loads and Ratings are recorded per Machine, because the machine itself changes how a coffee tastes, and each dashboard shows only its own Machine. Per-Machine catalogs were rejected because they duplicate the same package and make a later cross-Machine comparison impossible.

## Consequences

- Anyone with any Machine's token can edit a Coffee that other Machines use (accepted: trusted colleagues).
- A cross-Machine view can be added later without migrating data, since Ratings already record their Machine.
