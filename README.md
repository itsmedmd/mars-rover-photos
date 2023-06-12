# Mars Rover Photos

A website where you can view the latest images from Mars taken by NASA rovers.

This website uses Server-Side Rendering with Next.js to serve pages for infinitely scrolling masonry gallery,
with data from NASA's ["Mars Rover Photos"](https://github.com/chrisccerami/mars-photo-api) API
that's periodically fetched for new data that is then stored in Amazon DynamoDB in order to achieve the most efficiency
while rendering image gallery pages.

You can find live version [here](https://mars-rover-photos-itsmedmd.vercel.app).

v2.0.0 code was extracted from another personal project so there are some parts that might seem like unnecessarily split away. It's because those splits make sense in the full project from which this code was extracted, it's just that I didn't go through every single part to cater the code for this separated project.
