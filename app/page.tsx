"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { ModeToggle } from "@/components/theme-change-button";

import Highcharts from "highcharts";
import HighchartsStock from "highcharts/modules/stock";
import StockTools from "highcharts/modules/stock-tools";
import HighchartsIndicators from "highcharts/indicators/indicators";
import HighchartsStockTools from "highcharts/modules/stock-tools";
import HighchartsExporting from "highcharts/modules/exporting";
import "highcharts/css/stocktools/gui.css";

HighchartsStock(Highcharts);
HighchartsIndicators(Highcharts);
HighchartsStockTools(Highcharts);
StockTools(Highcharts);
HighchartsExporting(Highcharts);

export default function () {
  const pathname = usePathname();

  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        href="https://code.highcharts.com/css/stocktools/gui.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://code.highcharts.com/css/annotations/popup.css"
      />
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className="flex flex-grow overflow-hidden">
          {/* <Sidebar /> */}
          <div className="flex-1 overflow-hidden">
            <Chart currentPage={pathname} />
          </div>
        </div>
      </div>
      <div className="fixed right-5 bottom-4 z-50">
        <ModeToggle />
      </div>

      {/* Highcharts scripts */}
      <Script
        src="https://code.highcharts.com/stock/highstock.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://code.highcharts.com/modules/stock-tools.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://code.highcharts.com/modules/drag-panes.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://code.highcharts.com/modules/full-screen.js"
        strategy="afterInteractive"
      />
    </>
  );
}

const Chart = ({ currentPage }: { currentPage: string }) => {
  const pageTitle = currentPage.split("/").pop() || "Chart";

  useEffect(() => {
    const loadChart = async () => {
      const data = await fetch(
        "https://demo-live-data.highcharts.com/aapl-ohlcv.json"
      ).then((response) => response.json());

      const yearChangePoints = findYearChangePoints(data);

      const ohlc: [number, number, number, number, number][] = [];
      const volume: [number, number][] = [];
      data.forEach((dataPoint: number[]) => {
        ohlc.push([
          dataPoint[0],
          dataPoint[1],
          dataPoint[2],
          dataPoint[3],
          dataPoint[4],
        ]);
        volume.push([dataPoint[0], dataPoint[5]]);
      });

      if (typeof Highcharts !== "undefined") {
        const chart = Highcharts.stockChart("container", {
          chart: {
            borderRadius: 10,
            backgroundColor: "#f0f0f0",
            height: "50%",
          },
          stockTools: {
            gui: {
              enabled: true,
              buttons: [
                "indicators",
                "separator",
                "simpleShapes",
                "lines",
                "crookedLines",
                "measure",
                "advanced",
                "toggleAnnotations",
                "separator",
                "verticalLabels",
                "flags",
                "separator",
                "zoomChange",
                "fullScreen",
                "typeChange",
                "separator",
                "currentPriceIndicator",
                "saveChart",
              ],
            },
          },
          yAxis: [
            { labels: { align: "left" }, resize: { enabled: true } },
            { labels: { align: "left" }, top: "80%", height: "20%", offset: 0 },
          ],
          xAxis: {
            plotLines: yearChangePoints.map((point) => ({
              color: "#000000",
              width: 1,
              value: point,
              label: {
                text: new Date(point).getFullYear().toString(),
                rotation: 90,
                align: "left",
                x: 10,
                style: { color: "#000000" },
              },
            })),
          },
          tooltip: {
            enabled: true,
            shared: true,
            formatter: function () {
              return `<b>${this.x}</b><br/>${this.points
                .map(
                  (point: any) =>
                    `<span style="color:${point.series.color}">●</span> ${
                      point.series.name
                    }: ${point.y}`
                )
                .join("<br/>")}`;
            },
          },
          series: [
            {
              type: "candlestick",
              id: "aapl-ohlc",
              name: "AAPL Stock Price",
              data: ohlc,
            },
            {
              type: "column",
              id: "aapl-volume",
              name: "AAPL Volume",
              data: volume,
              yAxis: 1,
            },
          ],
        });

        chart.reflow();
      }
    };

    loadChart();
  }, []);

  return (<div id="container" className="chart z-50 h-2" style={{ height: '1000px' }} />
  );
};



function findYearChangePoints(data: [number, number][]): number[] {
  const yearChangePoints: number[] = [];
  let currentYear = new Date(data[0][0]).getFullYear();

  for (let i = 1; i < data.length; i++) {
    const date = new Date(data[i][0]);
    if (date.getFullYear() !== currentYear) {
      yearChangePoints.push(data[i][0]);
      currentYear = date.getFullYear();
    }
  }

  return yearChangePoints;
}