import ConfigParser

class Config:
	__dict__ = ["__configFile", "__configRaw"]
	def __init__(self, configFile):
		self.__configFile = configFile
		self.__configRaw = ConfigParser.RawConfigParser()
		self.__configRaw.read(configFile)
	def section(self, section):
		return ConfigSection(self, self.__configRaw, section)
	def save(self):
		print "writing to %s" % self.__configFile
		with open(self.__configFile, 'wb') as fp:
			self.__configRaw.write(fp)

class ConfigSection:
	__dict__ = ["config", "section", "__configRaw"]
	def __init__(self, config, raw, section):
		self.config = config
		self.section = section
		self.__configRaw = raw
		if( not self.__configRaw.has_section(section)):
			self.__configRaw.add_section(section)
	def set(self, option, value):
		self.__configRaw.set(self.section, option, value)
	def get(self, option):
		if(self.__configRaw.has_option(self.section, option)):
			return self.__configRaw.get(self.section, option)
		return None
	def save(self):
		self.config.save()
