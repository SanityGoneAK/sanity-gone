from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel

console = Console(stderr=True)
layout = Layout()
layout.split_row(
    Layout(name="left"),
    Layout(name="right"),
)

live = Live(layout, refresh_per_second=4, console=console)