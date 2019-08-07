import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { ButtonGroup, Button } from 'react-bootstrap';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

enum TIMEFRAME {
    DAY = 'Day',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year'
}

interface IFormattedSMReadings {
    [TIMEFRAME.DAY]: object;
    [TIMEFRAME.WEEK]: object;
    [TIMEFRAME.MONTH]: object;
    [TIMEFRAME.YEAR]: object;
}

export interface ISmartMeterReadingsChartProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export interface ISmartMeterReadingsChartState {
    selectedTimeFrame: string;
    readings: ProducingAsset.ISmartMeterRead[];
    formattedReadings: IFormattedSMReadings;
}

export class SmartMeterReadingsChart extends React.Component<ISmartMeterReadingsChartProps, ISmartMeterReadingsChartState> {
    constructor(props: ISmartMeterReadingsChartProps) {
        super(props);

        this.state = {
            selectedTimeFrame: TIMEFRAME.MONTH,
            readings: [],
            formattedReadings: {
                [TIMEFRAME.DAY]: [],
                [TIMEFRAME.WEEK]: [],
                [TIMEFRAME.MONTH]: [],
                [TIMEFRAME.YEAR]: []
            }
        };

        this.setSelectedTimeFrame = this.setSelectedTimeFrame.bind(this);
    }

    async componentDidMount() {
        const readings: ProducingAsset.ISmartMeterRead[] = await this.props.producingAsset.getSmartMeterReads();

        const formattedReadings = {
            [TIMEFRAME.DAY]: this.getFormattedReadings(readings, 'hour', 12, 'HH'),
            [TIMEFRAME.WEEK]: this.getFormattedReadings(readings, 'day', 7, 'D MMM'),
            [TIMEFRAME.MONTH]: this.getFormattedReadings(readings, 'day', 31, 'D MMM'),
            [TIMEFRAME.YEAR]: this.getFormattedReadings(readings, 'month', 12, 'MMM')
        };

        this.setState({
            readings,
            formattedReadings
        });
    }

    getFormattedReadings(
        readings: ProducingAsset.ISmartMeterRead[],
        timeframe: any,
        amount: number,
        keyFormat: string
    ) {
        const formatted = [];

        let currentIndex = 0;

        while (currentIndex < amount) {
            const currentDate = moment().subtract(currentIndex, timeframe);
            let totalEnergy = 0;

            for (const reading of readings) {
                const readingDate = moment.unix(reading.timestamp);

                if (readingDate.isSame(currentDate, timeframe)) {
                    totalEnergy += reading.energy;
                }
            }

            formatted.push({
                label: currentDate.format(keyFormat),
                value: totalEnergy
            });

            currentIndex += 1;
        }

        return formatted;
    }

    setSelectedTimeFrame(timeframe) {
        console.log({timeframe: TIMEFRAME[timeframe]})
        this.setState({
            selectedTimeFrame: TIMEFRAME[timeframe]
        });
    }

    render() {
        const { selectedTimeFrame, formattedReadings } = this.state;
        console.log({selectedTimeFrame, formattedReadings})

        const labels = formattedReadings[selectedTimeFrame].map(entry => entry.label);
        const values = formattedReadings[selectedTimeFrame].map(entry => entry.value);

        const data = {
            labels,
            datasets: [
                {
                    label: 'Power (Wh)',
                    data: values
                }
            ]
        };

        const availableTimeFrames = Object.keys(TIMEFRAME);

        return (
            <div className="smartMeterReadingsChart">
                <ButtonGroup
                    aria-label="Basic example"
                >
                    {availableTimeFrames.map(
                        (timeframe, index) => <Button
                            key={index}
                            onClick={() => this.setSelectedTimeFrame(timeframe)}
                            variant="primary">
                                {TIMEFRAME[timeframe]}
                        </Button>
                    )}
                </ButtonGroup>

                <Bar
                    data={data}
                    options={{ maintainAspectRatio: false }}
                />
            </div>
        );
    }
}
