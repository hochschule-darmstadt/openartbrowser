from locust import HttpLocust, TaskSet, task

# sends get requests with the same weight to the given URL

class MyTaskSet(TaskSet):
    # tests for regluar page
    @task(1)
    def index(self):
        self.client.get("/")

    @task(1)
    def artwork1(self):
        self.client.get("/artwork/Q683274")

    @task(1)
    def artwork2(self):
        self.client.get("/artwork/Q15290965")

    @task(1)
    def artwork3(self):
        self.client.get("/artwork/Q1810348")

    # tests for elasticsearch api

    @task(1)
    def search1(self):
        self.client.get("/api/_search?q=id:Q659396")

    @task(1)
    def search2(self):
        self.client.get("/api/_search?q=id:Q4882378")

    @task(1)
    def search3(self):
        self.client.get("/api/_search?q=id:Q1187408")


# executes the above tasks with a minimum of 1 and a maximum of 100
# milliseconds wait time for every spawned user
class MyLocust(HttpLocust):
    task_set = MyTaskSet
    min_wait = 1
    max_wait = 100
