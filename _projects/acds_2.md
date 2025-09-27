---
layout: page
title: Storm Prediction
description: Real-time lightning storm predictions with deep learning.
img: assets/img/project_covers/acds_2_cover.png
importance: 1
category: work
related_publications: false
---

## Motivation

Each year, lightning storms cause fatalities, wildfires, power outages, disruptions to air travel and flooding, often with little warning. Approximately 2000 thunderstorms are occurring at any given time around the world. Accurate, real-time predictions are essential to protect power grids, guide flight rerouting, and inform evacuation plans. With climate change contributing to more extreme and unpredictable weather patterns, real-time forecasting of lightning storms has never been more crucial: a 1 degree Celsius rise in temperature could result in a 12% increase in lightning strikes.

## Overview 

Key objectives are:
- Develop ML/DL-based models capable of predicting future weather patterns based on storm data.
- Generate reliable and explainable predictions for lightning storm evolution.
- Explore scalability and explainability for real-world applications.

### Dataset Overview

- **Satellite Images**:
  - Visible (VIS)
  - Water Vapor (IR069 - Infrared)
  - Cloud/Surface Temperature (IR107 - Infrared)
  - Vertically Integrated Liquid (VIL - Radar)
- **Lightning Flashes**:
  - Time series data

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/data_example1.gif" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/data_example2.gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Tasks Overview

- **Task 1A** - predict 12 future VIL frames based on 12 previous VIL frames.
- **Task 1B** - predict 12 future VIL frames using input frames from VIS, IR069, IR107, and VIL data.
- **Task 2** - generate missing VIL frames using VIS, IR069, and IR107 data.
- **Task 3** - predict lightning flashes; (1) number of flashes, (2) time occurence, (3) VIL pixel location of each flash

My work focused mostly on Task 3.

## Table of Contents
2. [Planning](#planning)
3. [Model Designs](#model-designs)
4. [Baseline Model](#baseline-model-and-implementation)
5. [Network Implementations and Results](#network-implementation-and-results)

### Data Analysis and Inspection

Data analysis and inspection involves looking at the dataset, inspecting the shape of our input and output (target) data. This gives an idea of what to feed into our models and the expected output. The section will dicuss the provided data; `events.csv` and `train.h5` files, and their content structure.

#### Provided Dataset
The `events.csv` is essentially a look-up table to available storm events. This is a csv file containing `ids` of all events available in the `train.h5` dataset. The .csv file is used to load all ids, and then load the corresponding event from the `train.h5` dataset.

```python
def load_ids(file_name="data/events.csv", n=10): # loads list of event ids of size n

def load_event(id): # loads the event from "train.h5" using event id
```

Loaded event contains the 4 image channels available to us *"vis"* (Visible), *"ir069"* (Infrared Water Vapor), *"ir017"* (Infrared Cloud/Surface Temperature), *"vil"* (Radar Vertically Integrated Liquid), and the *"lght"* (Ligthning Time Series).

- **"vis"** - 384x384 image with 36 frames per event/sample (36, 384, 384)
- **"vil"** - 384x384 image with 36 frames per event/sample (36, 384, 384)
- **"ir069"** - 192z192 image with 36 frames per event/sample (36, 192, 192)
- **"ir017"** - 192x192 image with 36 frames per event/sample (36, 192, 192)
- **"lght"** - array of N lightning strikes, with [time, latitude, longitude, pixel x, pixel y] (N, 5)

Inspecting the dataset revealed a generally clean data with no duplicate, missing or bad values. 

An individual event contains 36 frames, the frames of 4 input channels and corresponding lightning strike data can be combined to plot an overview of a particular storm event:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/baseline_example.gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

### Exploratory Data Analysis (EDA)

The EDA section focuses on analysing and visualising data patterns, which can later be used to guide our network design choices. First we take a look at the `events.csv` file:

---
| id  | start_utc               | center_lon   | center_lat  |
|-----|-------------------------|--------------|-------------|
| 0   | S778114 2018-08-20 19:50:00+00:00 | -90.382958   | 34.363062   |
| 5   | S767475 2018-08-20 21:30:00+00:00 | -92.317177   | 32.656136   |
| 10  | S771210 2018-08-20 21:40:00+00:00 | -113.388288  | 45.582713   |
| 15  | S782022 2018-08-21 00:20:00+00:00 | -111.000673  | 32.092002   |
| 20  | S769788 2018-08-21 17:10:00+00:00 | -78.634434   | 39.703476   |
---

We can reduce our events table, only keeping important columns;  `id`, `start_utc`, `center_lon` and `center_lat`. Meaning our events can be described by their geographic location (latitude and longitude) their start time and id. In the context of **Task3** however; except `id` these columns are not important. In terms of location, we want to focus on pixel (image wise) locations of the lightning flashes. And the time of occurance is only considered relative to particular event (not global date/time).

The `train.h5` dataset however; contains important information about each event, to later feed into our models. Each event can be identified through its `id` loaded from `events.csv`. As discussed, for each such event there are 4 image channels, and a lightning time series of the following shape:

---
| Channel | Shape                | Description                                               |
|---------|---------------------|-----------------------------------------------------------|
| vis     | (384, 384, 36)      | Visible satellite images, 36 frames per event/sample      |
| vil     | (384, 384, 36)      | Vertically Integrated Liquid (Radar), 36 frames per event |
| ir069   | (192, 192, 36)      | Infrared Water Vapor, 36 frames per event/sample          |
| ir107   | (192, 192, 36)      | Infrared Cloud/Surface Temp, 36 frames per event/sample   |
| lght    | (N, 5)              | Lightning strikes: [time, lat, lon, pixel x, pixel y]     |
---

When it comes to data imbalance, we can plot the total number of strikes across all events to visualise the distribution.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/strike_distribution.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Total Strikes Across All Events.
</div>

The distribution shows a clear imbalance in the number of lightning flashes. A few of the recorded storm events have more than 150 flashes, while most of the dataset (around 70%) have little to no flashes recorded. This hints that likely, not all of the recorded events are from a stormy weather. This could be great for our models, as they can learn to generalise over all weather events (and not just storms).

Similarly, we can also take a look at the imbalance in recorded time (`start_utc`) of the events:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/events_by_time.png" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/events_by_season.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Events by Time of the Day and Season.
</div>

The histogram shows that most of the events were recorded in the evening/night hours (18:00 to 24:00). While there is not a big imbalance, this is still something to take into account when designing our prediction models. Similarly, in seems that most events were recorded in summer and spring seasons. Again, the imbalance is not too big.

We can also consider the spatial imbalance. Given that the data was recorded in within the borders of the United States (USA), and that we have access to latitude and longitude of our events. We can plot the locations of each recorded event over the map to visualise the spatial distribution:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/event_locations_usa.png" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Event Locations in the USA.
</div>

Again, there is not a big imbalance, however; most of the events seem to have been recorded on the eastern half of the country. More importantly, a lot of the sparsely recorded area falls into the region of the 'Great Basin Desert'. The regions with a desert (or desert-like) climate tend to have less stormy events. This can hint to some imbalance, if there is a difference in storms over a desert-like regions and temperate (or other) more stormy regions.


## **Model Designs**

Model designs is the last step before implementation. It discusses a list of models to consider in the context of available dataset and task goal. In this task we aim to predict lightning flashes per each frame of the event. The target is shaped as a 384x384 lightning map. The input we feed into our models is 4 channels of 384x384 images.

The models considered in this project are the following:
1. Baseline model
2. U-NET (Per Event)
3. U-NET (Frame-by-Frame)
4. Convolutional LSTM

### Establishing a Baseline
A baseline model is the simplest model/manipulation to obtain a result from our data. In this case we decided to apply a mask/filter to one of our image channels (**VIL**), as it showed high correlation with target lightning flashes over many events. See [Baseline Model and Implementation](#baseline-model-and-implementation) for details.

### U-NET Event-by-Event
U-Net was chosen as one of the models to try and implement. It is a well-known arhictecture for image segmentation which aligns with our task of predicting pixel-wise lightning flash map (which has an image like representation). It is a simpler model to implement making a good starting point. U-Net also has a encoder-decoder structure which helps capture both local and global features (especially suitable given our multi-channel input data)

The first U-Net implementation processes our data event-by-event. Meaning the input and target have the following shapes:
```python
print(X.shape)  # (6, 36, 4, 64, 64)
print(y.shape)  # (6, 36, 1, 384, 384)
```

Input has 6 samples (events) per batch, each with 36 frames (with 4 channels of 384x384 images). Output has 6 samples (events) per batch, each with 36 frames (with a lightning map/grid of 384x384 per frame).

The benefit of processing data event-by-event is that it allows model to learn temporal correlations between frames within a single event (as in forecasting tasks, frames are sequential). By leveraging the sequential structure of the input, we hope that model understand the progression of storms more effectively.

### U-NET Frame-by-Frame
With a small modification to `Dataset`, `DataLoader` and our `U-Net` output structure, we can change the above design to a frame-by-frame implementation.

The frame-by-frame implementation should reduce the memory usage and computational complexity, as we are now only processing 36 frames (1 event) at a time (instead of a number of events). It also simplifies the model arhictecture and training process, helping understand the task better (and optimise more easily). It does however; come at the cost of losing temporal correlations between frames within a single event.

Our input and target have the following shapes:
```python
print(X.shape)  # (36, 4, 64, 64)
print(y.shape)  # (36, 1, 384, 384)
```

Here, a batch size of 36 makes sense (to include all frames within a single event).

### Convolutional LSTM (Conv-LSTM)
Finally, given the sequential nature of our forecasting task, we decided to implement a Convolutional Long Short Term Memory (conv-LSTM) model. Combinining a convolutional neural network (CNN) with LSTM can be useful in our case; considering the task involves both spatial and temporal data. CNNs are great at extracting spatial data from images, while LSTMs can handle the forecasting data (which has sequential structure) well. However this approach will come at the cost of hardware limitations. Both CNNs and LSTMs are computationally intensive requiring significant GPU/RAM. Espeically given our long sequence of 36 frames, and our large dataset `train5.h`. The Conv-LSTM is also a more complex model (compared to the previously discussed model designs) making it difficult to optimise our model. 

Our input and target would have the following shapes:
```python
print(X.shape)  # (36, 4, 384, 384)
print(y.shape)  # (36, 1, 384, 384)
```

This looks similar to U-Net frame-by-frame approach in shape, however given the internal mechanism of conv-LSTM, the sequential relationship between input frames will be taken into account (preserving the temporal relationship between invidual frames of an event).

## **Baseline Model and Implementation**

### Observation: Correlation with VIL channel (Vertically Integrated Liquid)
From analysis of imagery of the lightning strikes overlayed on the VIL channel there is a clear and strong relationship between pixel intensity and the location at which lightning tends to strike. This is seen throughout the weather events, when the total amount of water in a column of air picked up by the radar surpasses a certain threshold, a lightning strike occurs.

### Correlation to implementation 

The information from the VIL channel can be used directly to model the location of strikes, at the 5 minute time resolution of the image data. Applying a threshold to the pixel data and selecting any location above the intensity defined by the threshold to be the location of a lighting strike we get a purely spatial prediction.

This model is implemented using the `baseline_model` function that takes and event, normalises the vil image bewteen 0 and 1 to make the thrheshold interpretable, calls the `get_lightning_timeseires` to apply the threshold and pull the predictions.

### Limitations of this approach

The first limitation of this approach is that it is spatial, and does not take into account the full temporal nature of the lightning. The predictions of this model are made at time intervals of 5 minuites, as is the time resolution of the image data, and not at the actual one second resolution of the lightning strike recordings discovered in EDA. 

The other key limitation of this approach is that it is not able to predict the number of strikes, only their location. This two limitations are what more comlex models aim to adress and will be discussed in the following sections.

### Prediction

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/acds2/baseline_example.gif" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
   Baseline Model Prediction.
</div>

