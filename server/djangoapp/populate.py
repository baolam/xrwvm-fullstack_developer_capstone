from .models import CarMake, CarModel


def initiate():
    car_make_data = [
        {"name": "NISSAN", "description": "Great cars. Japanese technology"},
        {"name": "Mercedes", "description": "Set the standard for luxury automobiles"},
        {"name": "Ford", "description": "Built Ford Tough, American iconic brand"},
        {"name": "Toyota", "description": "Prioritizing quality and reliability"},
        {"name": "Honda", "description": "The Power of Dreams, dependable engineering"}
    ]

    car_make_instances = []
    for data in car_make_data:
        car_make_instances.append(
            CarMake.objects.create(name=data['name'], description=data['description'])
        )

    car_model_data = [
        {"name": "Pathfinder", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        {"name": "Qashqai", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        {"name": "X-Trail", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        {"name": "A-Class", "type": "SEDAN", "year": 2021, "car_make": car_make_instances[1]},
        {"name": "C-Class", "type": "SEDAN", "year": 2022, "car_make": car_make_instances[1]},
        {"name": "E-Class", "type": "SEDAN", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "Escape", "type": "SUV", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "Fusion", "type": "SEDAN", "year": 2020, "car_make": car_make_instances[2]},
        {"name": "Explorer", "type": "SUV", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "Corolla", "type": "SEDAN", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "Camry", "type": "SEDAN", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "RAV4", "type": "SUV", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "Civic", "type": "SEDAN", "year": 2023, "car_make": car_make_instances[4]},
        {"name": "Accord", "type": "SEDAN", "year": 2022, "car_make": car_make_instances[4]},
        {"name": "CR-V", "type": "SUV", "year": 2023, "car_make": car_make_instances[4]}
    ]

    for data in car_model_data:
        CarModel.objects.create(
            name=data['name'],
            car_make=data['car_make'],
            type=data['type'],
            year=data['year']
        )
    print("CarMake and CarModel database populated successfully.")
