import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { ButtonGroup, Button } from 'react-bootstrap';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import './SmartMeterReadingsChart.scss';

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
                label: timeframe !== 'hour' ? currentDate.format(keyFormat) : `${currentDate.format(keyFormat)}:00`,
                color: '#8059a6',
                value: totalEnergy
            });

            currentIndex += 1;
        }

        return formatted.reverse();
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

        const formattedData = formattedReadings[selectedTimeFrame];

        const data = {
            labels: formattedData.map(entry => entry.label),
            datasets: [
                {
                    label: 'Power (Wh)',
                    backgroundColor: formattedData.map(entry => entry.color),
                    data: formattedData.map(entry => entry.value)
                }
            ]
        };

        const availableTimeFrames = Object.keys(TIMEFRAME);

        return (
            <div className="smartMeterReadingsChart text-center">
                <ButtonGroup
                    aria-label="Basic example"
                    className="button-switcher mb-4"
                >
                    {availableTimeFrames.map(
                        (timeframe, index) => <Button
                            key={index}
                            onClick={() => this.setSelectedTimeFrame(timeframe)}
                            className={selectedTimeFrame === TIMEFRAME[timeframe] ? 'selected' : ''}
                            variant="primary">
                                {TIMEFRAME[timeframe]}
                        </Button>
                    )}
                </ButtonGroup>

                <div className="graph">
                    <Bar
                        data={data}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
            </div>
        );
    }
}
