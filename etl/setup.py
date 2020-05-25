import setuptools

setuptools.setup(
    name="openartbrowser_etl",
    version="0.1",
    author="openartbrowser",
    include_package_data=True,
    package_data={
        "": ["*.txt", "*.csv", "*.sparql"]
    },  # include files relevant for execution here
    url="https://github.com/hochschule-darmstadt/openartbrowser",
    packages=setuptools.find_packages(),  # resolves packages by the __init__.py file
    python_requires=">=3.7",
)
