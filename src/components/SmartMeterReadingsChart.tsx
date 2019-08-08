import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import 'moment/min/locales.min';
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
    graphOptions: object;
    selectedTimeFrame: ISelectedTimeFrame;
    readings: ProducingAsset.ISmartMeterRead[];
}

export class SmartMeterReadingsChart extends React.Component<ISmartMeterReadingsChartProps, ISmartMeterReadingsChartState> {
    constructor(props: ISmartMeterReadingsChartProps) {
        super(props);

        moment.locale(window.navigator.language);

        this.state = {
            graphOptions: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            },
            selectedTimeFrame: {
                timeframe: TIMEFRAME.MONTH,
                endDate: moment().toDate()
            },
            readings: []
        };

        this.setSelectedTimeFrame = this.setSelectedTimeFrame.bind(this);
        this.changeSelectedTimeFrame = this.changeSelectedTimeFrame.bind(this);
    }

    async componentDidMount() {
        const readings: ProducingAsset.ISmartMeterRead[] = await this.props.producingAsset.getSmartMeterReads();

        this.setState({ readings });
    }

    setSelectedTimeFrame(timeframe: ISelectedTimeFrame) {
        this.setState({ selectedTimeFrame: timeframe });
    }

    changeSelectedTimeFrame(increment: boolean = true) {
        const { selectedTimeFrame } = this.state;

        let measurementUnit;

        switch (selectedTimeFrame.timeframe) {
            case TIMEFRAME.DAY:
                measurementUnit = 'day';
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'month';
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'year';
                break;
        }

        const amount = selectedTimeFrame.timeframe === TIMEFRAME.WEEK ? 7 : 1;
        const currentDate = moment(selectedTimeFrame.endDate);

        const endDate = increment
            ? currentDate.add(amount, measurementUnit)
            : currentDate.subtract(amount, measurementUnit);

        this.setSelectedTimeFrame({
            timeframe: selectedTimeFrame.timeframe,
            endDate: endDate.toDate()
        });
    }

    get formattedReadings() {
        const { readings, selectedTimeFrame: {
            endDate, timeframe
        } } = this.state;
        const formatted = [];

        let measurementUnit;
        let amount;
        let keyFormat;
        let chartEndDate;

        switch (timeframe) {
            case TIMEFRAME.DAY:
                measurementUnit = 'hour';
                amount = 24;
                keyFormat = 'HH';
                chartEndDate = moment(endDate).endOf('day');
                break;

            case TIMEFRAME.WEEK:
                measurementUnit = 'day';
                amount = 7;
                keyFormat = 'ddd D MMM';
                chartEndDate = moment(endDate).endOf('week');
                break;

            case TIMEFRAME.MONTH:
                measurementUnit = 'day';
                amount = moment(endDate).daysInMonth();
                keyFormat = 'D MMM';
                chartEndDate = moment(endDate).endOf('month');
                break;

            case TIMEFRAME.YEAR:
                measurementUnit = 'month';
                amount = 12;
                keyFormat = 'MMM';
                chartEndDate = moment(endDate).endOf('year');
                break;
        }

        let currentIndex = 0;

        while (currentIndex < amount) {
            const currentDate = chartEndDate.clone().subtract(currentIndex, measurementUnit);
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

    get currentRangeInfo(): string {
        const { selectedTimeFrame: {
            timeframe, endDate
        } } = this.state;

        let rangeString;

        switch (timeframe) {
            case TIMEFRAME.DAY:
                rangeString = moment(endDate).format('D MMM YYYY');
                break;

            case TIMEFRAME.WEEK:
                rangeString = `${moment(endDate).startOf('week').format('D MMM YYYY')} - ${moment(endDate).endOf('week').format('D MMM YYYY')}`;
                break;

            case TIMEFRAME.MONTH:
                rangeString = moment(endDate).format('MMM YYYY');
                break;

            case TIMEFRAME.YEAR:
                rangeString = moment(endDate).format('YYYY');
                break;
        }

        return rangeString;
    }

    render() {
        const { selectedTimeFrame, graphOptions } = this.state;

        const data = {
            labels: this.formattedReadings.map(entry => entry.label),
            datasets: [
                {
                    label: 'Power (Wh)',
                    backgroundColor: this.formattedReadings.map(entry => entry.color),
                    data: this.formattedReadings.map(entry => entry.value)
                }
            ]
        };

        const timeFrameButtons = Object.keys(TIMEFRAME).map((timeframe, index) => {
            const onClick = () => this.setSelectedTimeFrame({
                timeframe: TIMEFRAME[timeframe],
                endDate: moment().toDate()
            });

            const isCurrentlySelected = selectedTimeFrame.timeframe === TIMEFRAME[timeframe];

            return (
                <Button
                    key={index}
                    onClick={onClick}
                    className={isCurrentlySelected ? 'selected' : ''}
                    variant="primary"
                >
                    {TIMEFRAME[timeframe]}
                </Button>
            );
        });

        graphOptions['title'] = {
            display: true,
            text: this.currentRangeInfo
        };

        return (
            <div className="smartMeterReadingsChart text-center">
                <div className="row mb-4 vertical-align">
                    <div className="col-lg-2">
                        <div
                            className="pull-left arrow-button"
                            onClick={() => this.changeSelectedTimeFrame(false)}
                        >
                            {'<'}
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <ButtonGroup className="button-switcher">
                            {timeFrameButtons}
                        </ButtonGroup>
                    </div>

                    <div className="col-lg-2">
                        <div
                            className="pull-right arrow-button"
                            onClick={() => this.changeSelectedTimeFrame(true)}
                        >
                            {'>'}
                        </div>
                    </div>
                </div>

                <div className="graph">
                    <Bar data={data} options={graphOptions} redraw={true} />
                </div>
            </div>
        );
    }
}
