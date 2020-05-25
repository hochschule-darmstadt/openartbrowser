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
    install_requires=[
        "elasticsearch>=7.0.0",
        "ijson>=2.3",
        "simplejson>=3.16.0",
        "pywikibot>=3.0.dev0",
        "requests>=2.22.0",
        "flake8>=3.7.9",
        "pyflakes>=2.1.1",
        "pycodestyle>=2.5.0",
        "pathspec>=0.6.0",
        "black>=19.10b0",
        "appdirs>=1.4.3",
        "regex>=2019.11.1",
        "pep8-naming>=0.9.1",
        "mccabe>=0.6.1",
        "pre-commit>=1.20.0",
        "SPARQLWrapper>=1.8.5",
    ],
)
