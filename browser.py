import zendriver as uc
import asyncio


class Browser:
    def __init__(self, url: str, headless: bool = False) -> None:
        self.url = url
        self.headless = headless
        self.browser = None
        exit()

    async def start_browser(self):
        try:
            self.browser = await uc.start(
                sandbox=False,
                browser_args=[
                    "--no-sandbox",
                    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 YaBrowser/24.10.0.0 Safari/537.36",
                    "--headless=new" if self.headless else "",
                ],
            )
        except Exception as e:
            print(f"Failed to start the browser: {e}")

    async def get_report_data(self) -> str | bool:
        if not self.browser:
            return False
        self.page = await self.browser.get(self.url)
        input()


async def get_report_data():
    solver = Browser("https://abrahamjuliot.github.io/creepjs/", headless=False)
    await solver.start_browser()
    data = await solver.get_report_data()
    return data


if __name__ == "__main__":
    asyncio.run(get_report_data())
