import utils.util_funcs as util_funcs

HTTP_HEADER = {
    "Content-Type": "application/json",
    "user_agent": util_funcs.agent_header(),
}

MAX_LAG = 10
SLEEP_TIME = 60
TIMEOUT = 5
