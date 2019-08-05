import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { ButtonGroup, Button } from 'react-bootstrap';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

enum TIMEFRAME {
    YEARLY = 'Yearly',
    MONTHLY = 'Monthly',
    WEEKLY = 'Weekly',
    DAILY = 'Daily'
}

export interface ISmartMeterReadingsChartProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export interface ISmartMeterReadingsChartState {
    selectedTimeFrame: TIMEFRAME;
}

export class SmartMeterReadingsChart extends React.Component<ISmartMeterReadingsChartProps, ISmartMeterReadingsChartState> {
    constructor(props: ISmartMeterReadingsChartProps) {
        super(props);

        this.state = {
            selectedTimeFrame: TIMEFRAME.MONTHLY
        };
    }

    render() {
        let data;

        switch (this.state.selectedTimeFrame) {
            case TIMEFRAME.YEARLY:
                data = {
                    labels: moment.monthsShort(),
                    datasets: [
                        {
                            label:'Power (Wh)',
                            data: [1,2,3,4,5,6,7,8,9,10,11,12]
                        }
                    ]
                };
                break;

            case TIMEFRAME.MONTHLY:
                const daysInMonth = moment().daysInMonth();
                data = {
                    labels: Array.from(Array(daysInMonth), (d, i) => i + 1),
                    datasets: [
                        {
                            label: 'Power (Wh)',
                            data: Array.from(Array(daysInMonth), (d, i) => i + 1)
                        }
                    ]
                };
                break;
        }

        let availableTimeFrames = Object.keys(TIMEFRAME);
        availableTimeFrames = availableTimeFrames.splice(
            Math.ceil(availableTimeFrames.length / 2),
            availableTimeFrames.length - 1
        );

        return (
            <div className="smartMeterReadingsChart">
                <ButtonGroup aria-label="Basic example">
                    {availableTimeFrames.map(
                        (timeframe, index) => <Button
                            key={index}
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
