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

interface ISelectedTimeFrame {
    timeframe: string;
    endDate: Date;
}

export interface ISmartMeterReadingsChartProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export interface ISmartMeterReadingsChartState {
    selectedTimeFrame: ISelectedTimeFrame;
    readings: ProducingAsset.ISmartMeterRead[];
}

export class SmartMeterReadingsChart extends React.Component<ISmartMeterReadingsChartProps, ISmartMeterReadingsChartState> {
    constructor(props: ISmartMeterReadingsChartProps) {
        super(props);

        this.state = {
            selectedTimeFrame: {
                timeframe: TIMEFRAME.MONTH,
                endDate: moment().toDate()
            },
            readings: []
        };

        this.setSelectedTimeFrame = this.setSelectedTimeFrame.bind(this);
        this.getFormattedReadings = this.getFormattedReadings.bind(this)
    }

    async componentDidMount() {
        const readings: ProducingAsset.ISmartMeterRead[] = await this.props.producingAsset.getSmartMeterReads();

        this.setState({
            readings
        });
    }

    getFormattedReadings(timeframe: ISelectedTimeFrame) {
        const { readings } = this.state;
        const formatted = [];

        let measurementUnit;
        let amount;
        let keyFormat;

        switch (timeframe.timeframe) {
            case TIMEFRAME.DAY:
                measurementUnit = 'hour';
                amount = 12;
                keyFormat = 'HH';
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'D MMM';
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'day';
                amount = 31;
                keyFormat = 'D MMM';
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'month';
                amount = 12;
                keyFormat = 'MMM';
                break;
        }

        let currentIndex = 0;
        const endDate = moment(timeframe.endDate);

        while (currentIndex < amount) {
            const currentDate = endDate.clone().subtract(currentIndex, measurementUnit);
            let totalEnergy = 0;

            for (const reading of readings) {
                const readingDate = moment.unix(reading.timestamp);

                if (readingDate.isSame(currentDate, measurementUnit)) {
                    totalEnergy += reading.energy;
                }
            }

            formatted.push({
                label: measurementUnit !== 'hour' ? currentDate.format(keyFormat) : `${currentDate.format(keyFormat)}:00`,
                color: '#8059a6',
                value: totalEnergy
            });

            currentIndex += 1;
        }

        return formatted.reverse();
    }

    setSelectedTimeFrame(timeframe) {
        this.setState({
            selectedTimeFrame: {
                timeframe: TIMEFRAME[timeframe],
                endDate: moment().toDate()
            }
        });
    }

    render() {
        const { selectedTimeFrame } = this.state;
        console.log({selectedTimeFrame});

        const formattedData = this.getFormattedReadings(selectedTimeFrame);

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
                            className={selectedTimeFrame.timeframe === TIMEFRAME[timeframe] ? 'selected' : ''}
                            variant="primary">
                                {TIMEFRAME[timeframe]}
                        </Button>
                    )}
                </ButtonGroup>

                {/* <div className="row">
                    <div className="col">
                        <Button variant="primary">
                            {'<'}
                        </Button>
                    </div>

                    <div className="col">
                        <Button variant="primary">
                            {'>'}
                        </Button>
                    </div>
                </div> */}

                <div className="graph">
                    <Bar
                        data={data}
                        options={{
                            maintainAspectRatio: false
                        }}
                    />
                </div>
            </div>
        );
    }
}
